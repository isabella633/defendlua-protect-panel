ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS cli_protection_mode text NOT NULL DEFAULT 'obfuscate'
CHECK (cli_protection_mode IN ('obfuscate','vm'));