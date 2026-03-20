
-- Table to store which Discord roles are authorized as "staff" for a script owner
CREATE TABLE public.discord_bot_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  guild_id text NOT NULL,
  role_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, guild_id, role_id)
);

ALTER TABLE public.discord_bot_roles ENABLE ROW LEVEL SECURITY;

-- Only the owning user can manage their bot roles (via service role from edge function)
CREATE POLICY "Service role full access" ON public.discord_bot_roles
  FOR ALL USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);
