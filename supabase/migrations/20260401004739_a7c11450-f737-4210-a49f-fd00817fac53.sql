
-- Create rate_limits table for persistent rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role only" ON public.rate_limits
  FOR ALL TO public
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Create index for cleanup
CREATE INDEX idx_rate_limits_expires ON public.rate_limits (expires_at);

-- Atomic check-and-increment function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_ms INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_in INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window INTERVAL := (p_window_ms || ' milliseconds')::INTERVAL;
  v_count INTEGER;
  v_expires TIMESTAMPTZ;
BEGIN
  -- Delete expired entry if exists
  DELETE FROM public.rate_limits WHERE rate_limits.key = p_key AND expires_at <= v_now;

  -- Upsert: increment or create
  INSERT INTO public.rate_limits (key, count, window_start, expires_at)
  VALUES (p_key, 1, v_now, v_now + v_window)
  ON CONFLICT (key) DO UPDATE SET count = rate_limits.count + 1
  RETURNING rate_limits.count, rate_limits.expires_at INTO v_count, v_expires;

  allowed := v_count <= p_limit;
  remaining := GREATEST(p_limit - v_count, 0);
  reset_in := GREATEST(EXTRACT(EPOCH FROM (v_expires - v_now))::INTEGER * 1000, 0);
  RETURN NEXT;
END;
$$;

-- Cleanup function for old entries (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits WHERE expires_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
