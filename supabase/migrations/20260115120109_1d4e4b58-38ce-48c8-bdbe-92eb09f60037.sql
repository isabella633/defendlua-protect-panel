-- Drop the restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can create their own link codes" ON public.discord_link_codes;
DROP POLICY IF EXISTS "Users can delete their own link codes" ON public.discord_link_codes;
DROP POLICY IF EXISTS "Users can view their own link codes" ON public.discord_link_codes;

-- Recreate as permissive policies
CREATE POLICY "Users can create their own link codes" 
ON public.discord_link_codes 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own link codes" 
ON public.discord_link_codes 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own link codes" 
ON public.discord_link_codes 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);