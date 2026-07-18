
REVOKE EXECUTE ON FUNCTION public.on_subscription_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.apply_free_plan_constraints(uuid) FROM anon, authenticated, public;
