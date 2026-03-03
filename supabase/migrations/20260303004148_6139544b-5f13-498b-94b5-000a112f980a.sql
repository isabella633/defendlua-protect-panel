
-- Add slug column to scripts
ALTER TABLE public.scripts ADD COLUMN slug text UNIQUE;

-- Generate slugs for existing scripts
UPDATE public.scripts SET slug = LOWER(SUBSTRING(MD5(id::text || RANDOM()::text) FROM 1 FOR 12)) WHERE slug IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE public.scripts ALTER COLUMN slug SET NOT NULL;

-- Set default for new scripts
ALTER TABLE public.scripts ALTER COLUMN slug SET DEFAULT LOWER(SUBSTRING(MD5(RANDOM()::text || CLOCK_TIMESTAMP()::text) FROM 1 FOR 12));

-- Create index for fast lookups
CREATE INDEX idx_scripts_slug ON public.scripts(slug);
