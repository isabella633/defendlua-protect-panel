ALTER TABLE public.scripts
  ADD COLUMN IF NOT EXISTS vm_protection_mode text NOT NULL DEFAULT 'off'
    CHECK (vm_protection_mode IN ('off','safe','balanced'));