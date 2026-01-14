-- Create table to store Discord account links
CREATE TABLE public.discord_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  discord_id TEXT NOT NULL UNIQUE,
  discord_username TEXT,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for temporary link codes
CREATE TABLE public.discord_link_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discord_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_link_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for discord_links
CREATE POLICY "Users can view their own Discord link"
ON public.discord_links FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Discord link"
ON public.discord_links FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage Discord links"
ON public.discord_links FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for discord_link_codes
CREATE POLICY "Users can view their own link codes"
ON public.discord_link_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own link codes"
ON public.discord_link_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own link codes"
ON public.discord_link_codes FOR DELETE
USING (auth.uid() = user_id);

-- Function to generate a random 6-character link code
CREATE OR REPLACE FUNCTION public.generate_discord_link_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    
    -- Check if code already exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM public.discord_link_codes 
      WHERE discord_link_codes.code = generate_discord_link_code.code 
      AND expires_at > NOW() 
      AND used = false
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Index for faster lookups
CREATE INDEX idx_discord_links_discord_id ON public.discord_links(discord_id);
CREATE INDEX idx_discord_link_codes_code ON public.discord_link_codes(code);
CREATE INDEX idx_discord_link_codes_expires ON public.discord_link_codes(expires_at) WHERE used = false;