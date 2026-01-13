-- Create a trigger function to validate webhook_url format on scripts table
CREATE OR REPLACE FUNCTION public.validate_webhook_url()
RETURNS TRIGGER AS $$
BEGIN
  -- If webhook_url is being set (not null and not empty)
  IF NEW.webhook_url IS NOT NULL AND NEW.webhook_url != '' THEN
    -- Validate Discord webhook URL format
    IF NEW.webhook_url !~ '^https://discord\.com/api/webhooks/\d+/[A-Za-z0-9_-]+$' THEN
      RAISE EXCEPTION 'Invalid Discord webhook URL format. URL must match: https://discord.com/api/webhooks/{id}/{token}';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for INSERT and UPDATE on scripts table
DROP TRIGGER IF EXISTS validate_webhook_url_trigger ON public.scripts;
CREATE TRIGGER validate_webhook_url_trigger
BEFORE INSERT OR UPDATE ON public.scripts
FOR EACH ROW
EXECUTE FUNCTION public.validate_webhook_url();