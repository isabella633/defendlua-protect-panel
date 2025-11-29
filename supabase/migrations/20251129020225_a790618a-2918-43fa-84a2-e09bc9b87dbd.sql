-- Add IP whitelist to scripts table
ALTER TABLE public.scripts
ADD COLUMN ip_list text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.scripts.ip_list IS 'Array of whitelisted IP addresses that can access this script';