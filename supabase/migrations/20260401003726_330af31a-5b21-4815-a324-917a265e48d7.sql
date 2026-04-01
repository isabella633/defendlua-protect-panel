
-- Fix validate_webhook_url search_path
CREATE OR REPLACE FUNCTION public.validate_webhook_url()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.webhook_url IS NOT NULL AND NEW.webhook_url != '' THEN
    IF NEW.webhook_url !~ '^https://discord\.com/api/webhooks/\d+/[A-Za-z0-9_-]+$' THEN
      RAISE EXCEPTION 'Invalid Discord webhook URL format. URL must match: https://discord.com/api/webhooks/{id}/{token}';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user_subscription search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$function$;

-- Fix enqueue_email search_path
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$ SELECT pgmq.send(queue_name, payload); $function$;

-- Fix move_to_dlq search_path
CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$function$;

-- Fix read_email_batch search_path
CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $function$;

-- Fix delete_email search_path
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$ SELECT pgmq.delete(queue_name, message_id); $function$;
