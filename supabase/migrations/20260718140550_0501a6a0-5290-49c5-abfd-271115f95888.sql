
CREATE TABLE public.tamper_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid REFERENCES public.scripts(id) ON DELETE SET NULL,
  script_slug text,
  reason text NOT NULL,
  hwid text,
  ip text,
  user_agent text,
  discord_user_id text,
  discord_username text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tamper_logs TO authenticated;
GRANT ALL ON public.tamper_logs TO service_role;

ALTER TABLE public.tamper_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view tamper logs for their scripts"
ON public.tamper_logs FOR SELECT
TO authenticated
USING (
  script_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = tamper_logs.script_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all tamper logs"
ON public.tamper_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_tamper_logs_script ON public.tamper_logs(script_id, created_at DESC);
CREATE INDEX idx_tamper_logs_created ON public.tamper_logs(created_at DESC);
