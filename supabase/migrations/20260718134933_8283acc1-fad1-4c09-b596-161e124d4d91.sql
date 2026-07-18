
-- 1) Analytics: add country column to access_logs
ALTER TABLE public.access_logs ADD COLUMN IF NOT EXISTS country text;

-- 2) Auto-disable tracking on scripts
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS auto_disabled_at timestamptz;
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS auto_disabled_reason text;

-- Update apply_free_plan_constraints to record why/when
CREATE OR REPLACE FUNCTION public.apply_free_plan_constraints(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  keep_ids uuid[];
BEGIN
  SELECT ARRAY(
    SELECT id FROM public.scripts
    WHERE owner_id = _user_id
    ORDER BY created_at ASC
    LIMIT 3
  ) INTO keep_ids;

  UPDATE public.scripts
  SET disabled = true,
      auto_disabled_at = COALESCE(auto_disabled_at, now()),
      auto_disabled_reason = 'Auto-disabled: exceeds free plan 3-script limit',
      updated_at = now()
  WHERE owner_id = _user_id
    AND NOT (id = ANY(keep_ids))
    AND disabled = false;

  UPDATE public.scripts
  SET disabled = false,
      auto_disabled_at = NULL,
      auto_disabled_reason = NULL,
      public_access = true,
      updated_at = now()
  WHERE id = ANY(keep_ids);
END;
$function$;

-- 3) Version history
CREATE TABLE IF NOT EXISTS public.script_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_script_versions_script_created
  ON public.script_versions(script_id, created_at DESC);

GRANT SELECT, DELETE ON public.script_versions TO authenticated;
GRANT ALL ON public.script_versions TO service_role;

ALTER TABLE public.script_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own script versions"
  ON public.script_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = script_versions.script_id AND s.owner_id = auth.uid()
  ));

CREATE POLICY "Owners delete own script versions"
  ON public.script_versions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = script_versions.script_id AND s.owner_id = auth.uid()
  ));

-- No INSERT policy — versions are created by trigger (SECURITY DEFINER)

-- Snapshot trigger: on UPDATE of script_key (or INSERT of new script), store previous version and trim to last 10
CREATE OR REPLACE FUNCTION public.snapshot_script_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_ids uuid[];
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.script_versions(script_id, content)
    VALUES (NEW.id, NEW.script_key);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.script_key IS DISTINCT FROM OLD.script_key THEN
    INSERT INTO public.script_versions(script_id, content)
    VALUES (NEW.id, NEW.script_key);

    -- Trim to last 10 versions
    SELECT ARRAY(
      SELECT id FROM public.script_versions
      WHERE script_id = NEW.id
      ORDER BY created_at DESC
      OFFSET 10
    ) INTO old_ids;

    IF array_length(old_ids, 1) > 0 THEN
      DELETE FROM public.script_versions WHERE id = ANY(old_ids);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.snapshot_script_version() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_snapshot_script_version ON public.scripts;
CREATE TRIGGER trg_snapshot_script_version
  AFTER INSERT OR UPDATE OF script_key ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_script_version();

-- Backfill: create an initial version snapshot for any script that has none
INSERT INTO public.script_versions(script_id, content, created_at)
SELECT s.id, s.script_key, s.created_at
FROM public.scripts s
LEFT JOIN public.script_versions v ON v.script_id = s.id
WHERE v.id IS NULL;

-- 4) 90-day cleanup for access_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_access_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_count integer;
BEGIN
  DELETE FROM public.access_logs WHERE accessed_at < now() - interval '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_access_logs() FROM PUBLIC, anon, authenticated;

-- Schedule daily cleanup (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('cleanup-old-access-logs')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-access-logs');
    PERFORM cron.schedule('cleanup-old-access-logs', '17 3 * * *',
      $cron$ SELECT public.cleanup_old_access_logs(); $cron$);
  END IF;
END $$;
