-- Remove the dangerous UPDATE policy that allows users to change their own subscription plan
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;