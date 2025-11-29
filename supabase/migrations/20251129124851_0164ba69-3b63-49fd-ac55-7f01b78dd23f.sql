-- Add public_access toggle and blacklist to scripts table
ALTER TABLE public.scripts 
ADD COLUMN public_access BOOLEAN DEFAULT FALSE,
ADD COLUMN hwid_blacklist TEXT[] DEFAULT '{}';

-- Create access_logs table to track all script accesses
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  hwid TEXT NOT NULL,
  ip_address TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL, -- 'allowed' or 'denied'
  reason TEXT
);

-- Enable RLS on access_logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Only script owners can view their access logs
CREATE POLICY "Owners can view access logs for their scripts"
ON public.access_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.scripts
    WHERE scripts.id = access_logs.script_id
    AND scripts.owner_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_access_logs_script_id ON public.access_logs(script_id);
CREATE INDEX idx_access_logs_accessed_at ON public.access_logs(accessed_at DESC);