
CREATE TABLE public.key_link_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  discord_id text NOT NULL,
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  visited_at timestamptz,
  completed boolean NOT NULL DEFAULT false
);

ALTER TABLE public.key_link_verifications ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only accessed via service role from edge functions
