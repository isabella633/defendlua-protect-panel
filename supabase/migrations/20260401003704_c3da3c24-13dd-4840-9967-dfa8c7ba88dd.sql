
-- 1. Remove dangerous INSERT policy on subscriptions (prevents privilege escalation)
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;

-- 2. Fix search_path syntax on generate_discord_link_code
CREATE OR REPLACE FUNCTION public.generate_discord_link_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(
      SELECT 1 FROM public.discord_link_codes 
      WHERE discord_link_codes.code = new_code
      AND expires_at > NOW() 
      AND used = false
    ) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- 3. Add server-side HWID limit enforcement trigger
CREATE OR REPLACE FUNCTION public.enforce_hwid_limit()
RETURNS TRIGGER AS $$
DECLARE
  hwid_limit INTEGER;
BEGIN
  hwid_limit := public.get_hwid_limit(NEW.owner_id);
  IF NEW.hwid_list IS NOT NULL AND array_length(NEW.hwid_list, 1) > hwid_limit THEN
    RAISE EXCEPTION 'HWID limit exceeded for your plan (max %)', hwid_limit;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_hwid_limit_trigger ON public.scripts;
CREATE TRIGGER enforce_hwid_limit_trigger
  BEFORE INSERT OR UPDATE ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_hwid_limit();

-- 4. Add RLS policies for generated_keys (currently has RLS enabled but no policies)
CREATE POLICY "Service role full access on generated_keys"
  ON public.generated_keys FOR ALL
  TO public
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- 5. Add RLS policies for key_link_verifications (currently has RLS enabled but no policies)
CREATE POLICY "Service role full access on key_link_verifications"
  ON public.key_link_verifications FOR ALL
  TO public
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);
