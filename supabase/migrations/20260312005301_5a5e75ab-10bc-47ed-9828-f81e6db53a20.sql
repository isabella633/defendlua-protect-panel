
-- Key system provider type
CREATE TYPE public.key_provider AS ENUM ('linkvertise', 'workink');
-- Key system redeem action type
CREATE TYPE public.key_redeem_action AS ENUM ('whitelist', 'temporary');

-- Key system config per script (owner sets this up via /setup)
CREATE TABLE public.key_system_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  provider key_provider NOT NULL,
  provider_link TEXT NOT NULL,
  key_expiry_hours INTEGER NOT NULL DEFAULT 24,
  redeem_action key_redeem_action NOT NULL DEFAULT 'whitelist',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(script_id)
);

-- Generated keys (created when user completes /getkey flow)
CREATE TABLE public.generated_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  discord_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_hwid TEXT
);

-- Enable RLS
ALTER TABLE public.key_system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_keys ENABLE ROW LEVEL SECURITY;

-- RLS policies for key_system_configs (owners manage their own)
CREATE POLICY "Owners can view their script key configs"
  ON public.key_system_configs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = key_system_configs.script_id AND scripts.owner_id = auth.uid()));

CREATE POLICY "Owners can insert key configs for their scripts"
  ON public.key_system_configs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = key_system_configs.script_id AND scripts.owner_id = auth.uid()));

CREATE POLICY "Owners can update their script key configs"
  ON public.key_system_configs FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = key_system_configs.script_id AND scripts.owner_id = auth.uid()));

CREATE POLICY "Owners can delete their script key configs"
  ON public.key_system_configs FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = key_system_configs.script_id AND scripts.owner_id = auth.uid()));

-- RLS for generated_keys - service role handles everything (edge function uses service role)
-- No public policies needed since the Discord bot uses service role key
