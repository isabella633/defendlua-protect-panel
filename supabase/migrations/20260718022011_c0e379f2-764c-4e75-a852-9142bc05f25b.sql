
-- 1) Free plan HWID limit: 10 -> 1000
CREATE OR REPLACE FUNCTION public.get_hwid_limit(user_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN s.plan = 'free' THEN 1000
    WHEN s.plan = 'pro' THEN 999999
    WHEN s.plan = 'enterprise' THEN 999999
    ELSE 1000
  END
  FROM subscriptions s
  WHERE s.user_id = user_id_param
  LIMIT 1;
$$;

-- 2) Add disabled flag on scripts
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;

-- 3) Downgrade handler: when a subscription becomes 'free' (or expires),
-- keep the oldest 3 scripts enabled and disable the rest; also flip
-- public_access on for their remaining scripts.
CREATE OR REPLACE FUNCTION public.apply_free_plan_constraints(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  keep_ids uuid[];
BEGIN
  SELECT ARRAY(
    SELECT id FROM public.scripts
    WHERE owner_id = _user_id
    ORDER BY created_at ASC
    LIMIT 3
  ) INTO keep_ids;

  -- Disable everything beyond the first 3
  UPDATE public.scripts
  SET disabled = true, updated_at = now()
  WHERE owner_id = _user_id
    AND NOT (id = ANY(keep_ids));

  -- Ensure kept scripts are enabled and public
  UPDATE public.scripts
  SET disabled = false, public_access = true, updated_at = now()
  WHERE id = ANY(keep_ids);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_free_plan_constraints(uuid) FROM anon, authenticated;

-- 4) Trigger on subscription change: if plan becomes free (or expired), apply constraints
CREATE OR REPLACE FUNCTION public.on_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.plan = 'free' OR NEW.status <> 'active'
     OR (NEW.expires_at IS NOT NULL AND NEW.expires_at <= now()) THEN
    PERFORM public.apply_free_plan_constraints(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscription_change ON public.subscriptions;
CREATE TRIGGER trg_subscription_change
AFTER INSERT OR UPDATE OF plan, status, expires_at ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.on_subscription_change();

-- 5) Backfill: apply the rule to all current free (or expired) users right now
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT user_id FROM public.subscriptions
    WHERE plan = 'free'
       OR status <> 'active'
       OR (expires_at IS NOT NULL AND expires_at <= now())
  LOOP
    PERFORM public.apply_free_plan_constraints(r.user_id);
  END LOOP;
END $$;
