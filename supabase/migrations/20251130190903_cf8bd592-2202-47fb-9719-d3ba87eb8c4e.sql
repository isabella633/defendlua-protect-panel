-- Remove unique constraint from script_key column
-- This allows users to protect the same Lua code multiple times with different configurations
ALTER TABLE public.scripts DROP CONSTRAINT IF EXISTS scripts_script_key_key;