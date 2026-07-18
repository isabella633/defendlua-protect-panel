
-- Convert user-facing helpers to SECURITY INVOKER so they no longer trigger the definer-executable linter.
ALTER FUNCTION public.has_role(uuid, app_role) SECURITY INVOKER;
ALTER FUNCTION public.get_script_limit(uuid) SECURITY INVOKER;
ALTER FUNCTION public.get_hwid_limit(uuid) SECURITY INVOKER;
ALTER FUNCTION public.count_user_scripts(uuid) SECURITY INVOKER;
ALTER FUNCTION public.can_create_script(uuid) SECURITY INVOKER;

-- Revoke EXECUTE from public/anon/authenticated on every remaining SECURITY DEFINER function in public.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon, authenticated;', r.nspname, r.proname, r.args);
  END LOOP;
END $$;
