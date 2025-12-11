-- Add INSERT policy for access_logs - only system/edge functions via service role can insert
CREATE POLICY "System can insert access logs"
ON public.access_logs
FOR INSERT
WITH CHECK (false); -- Blocks direct inserts, service role bypasses RLS

-- Add UPDATE policy for access_logs - prevent any updates
CREATE POLICY "Access logs cannot be updated"
ON public.access_logs
FOR UPDATE
USING (false);

-- Add DELETE policy for access_logs - prevent any deletions
CREATE POLICY "Access logs cannot be deleted"
ON public.access_logs
FOR DELETE
USING (false);

-- Add DELETE policy for subscriptions - only admins can delete
CREATE POLICY "Only admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add DELETE policy for user_preferences - users can delete their own
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for profiles - prevent deletion to maintain data integrity
CREATE POLICY "Profiles cannot be deleted"
ON public.profiles
FOR DELETE
USING (false);