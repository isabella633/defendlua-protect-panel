-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage Discord links" ON public.discord_links;

-- The service role key bypasses RLS anyway, so we don't need that policy
-- Instead, we need a policy for system to insert links (from edge function with service role)
-- Since service role bypasses RLS, no additional policy is needed for it