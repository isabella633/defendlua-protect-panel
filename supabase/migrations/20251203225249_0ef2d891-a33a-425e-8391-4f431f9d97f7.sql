-- Function to get the script limit based on user's plan
CREATE OR REPLACE FUNCTION public.get_script_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN s.plan = 'free' THEN 3
    WHEN s.plan = 'pro' THEN 999999  -- effectively unlimited
    WHEN s.plan = 'enterprise' THEN 999999  -- effectively unlimited
    ELSE 3  -- default to free plan limits
  END
  FROM subscriptions s
  WHERE s.user_id = user_id_param
  LIMIT 1;
$$;

-- Function to get the HWID limit based on user's plan
CREATE OR REPLACE FUNCTION public.get_hwid_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN s.plan = 'free' THEN 10
    WHEN s.plan = 'pro' THEN 100
    WHEN s.plan = 'enterprise' THEN 999999  -- effectively unlimited
    ELSE 10  -- default to free plan limits
  END
  FROM subscriptions s
  WHERE s.user_id = user_id_param
  LIMIT 1;
$$;

-- Function to count user's current scripts
CREATE OR REPLACE FUNCTION public.count_user_scripts(user_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM scripts
  WHERE owner_id = user_id_param;
$$;

-- Function to check if user can create more scripts
CREATE OR REPLACE FUNCTION public.can_create_script(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.count_user_scripts(user_id_param) < public.get_script_limit(user_id_param);
$$;

-- Drop the existing INSERT policy for scripts
DROP POLICY IF EXISTS "Owners can insert their own scripts" ON public.scripts;

-- Create new INSERT policy that enforces script limits
CREATE POLICY "Owners can insert their own scripts with limit check"
ON public.scripts
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND public.can_create_script(auth.uid())
);