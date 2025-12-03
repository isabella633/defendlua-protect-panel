-- Add webhook_url column to scripts table for Discord webhook integration (Pro/Enterprise feature)
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS webhook_url TEXT DEFAULT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN public.scripts.webhook_url IS 'Discord webhook URL for Pro/Enterprise users to receive access logs';