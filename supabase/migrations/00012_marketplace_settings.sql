-- ==========================================
-- MARKETPLACE SETTINGS
-- ==========================================
-- Migration: 00012_marketplace_settings.sql
-- Purpose: Global configuration for the marketplace, including Maintenance Mode.
-- ==========================================

CREATE TABLE IF NOT EXISTS public.marketplace_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Secufur',
  commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  support_email TEXT,
  contact_number TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Ensure there is exactly one row
INSERT INTO public.marketplace_settings (id, name, commission_percentage, maintenance_mode)
VALUES (1, 'Secufur', 10.00, false)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read the settings (needed for middleware/edge)
CREATE POLICY "Marketplace settings are viewable by everyone"
  ON public.marketplace_settings
  FOR SELECT
  USING (true);

-- Only admins can update the settings
CREATE POLICY "Marketplace settings are updatable by admins only"
  ON public.marketplace_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
