-- Fix 1: Add UPDATE policy to subscriptions table that explicitly denies user updates
-- All subscription modifications must go through the secure redeem-activation-code edge function
CREATE POLICY "Users cannot update subscriptions directly" 
ON public.subscriptions 
FOR UPDATE 
USING (false);

-- Fix 2: Fix the generate_activation_code function to have immutable search_path
CREATE OR REPLACE FUNCTION public.generate_activation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 16-character code in format XXXX-XXXX-XXXX-XXXX
    code := CONCAT(
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)), '-',
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)), '-',
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)), '-',
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4))
    );
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.activation_codes WHERE activation_codes.code = generate_activation_code.code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$function$;