-- Update get_hwid_limit function to give Pro plan unlimited HWIDs
CREATE OR REPLACE FUNCTION public.get_hwid_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN s.plan = 'free' THEN 10
    WHEN s.plan = 'pro' THEN 999999  -- unlimited for pro
    WHEN s.plan = 'enterprise' THEN 999999  -- unlimited for enterprise
    ELSE 10  -- default to free plan limits
  END
  FROM subscriptions s
  WHERE s.user_id = user_id_param
  LIMIT 1;
$$;