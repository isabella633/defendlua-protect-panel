ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS obfuscation_preset text NOT NULL DEFAULT 'medium';

ALTER TABLE public.scripts
DROP CONSTRAINT IF EXISTS scripts_obfuscation_preset_check;

ALTER TABLE public.scripts
ADD CONSTRAINT scripts_obfuscation_preset_check
CHECK (obfuscation_preset IN ('light','medium','heavy','insane'));