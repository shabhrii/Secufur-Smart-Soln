-- ==========================================
-- ADMIN GOVERNANCE FOUNDATION
-- ==========================================
-- Migration: 00010_admin_moderation.sql
-- Purpose: Add admin moderation infrastructure while preserving
--          existing buyer and seller functionality.
--
-- SAFETY NOTES:
-- 1. All new columns are nullable or have safe defaults.
-- 2. Existing sellers are backfilled to 'approved'.
-- 3. Existing products are backfilled to 'approved'.
-- 4. No existing RLS policies are modified.
-- 5. The is_admin() helper is additive only.
-- ==========================================


-- ──────────────────────────────────────────
-- A. SELLER STATUS LIFECYCLE EXTENSION
-- ──────────────────────────────────────────

-- Add 'suspended' to the existing seller_status enum.
-- This is a non-destructive additive change.
ALTER TYPE public.seller_status ADD VALUE IF NOT EXISTS 'suspended';

-- Add rejection feedback column to sellers table.
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;


-- ──────────────────────────────────────────
-- B. PRODUCT MODERATION LIFECYCLE
-- ──────────────────────────────────────────

-- Create a new enum specifically for moderation.
-- This is separate from product_status (draft/active/archived) which
-- represents the seller's publishing intent.
DO $$ BEGIN
  CREATE TYPE public.moderation_status AS ENUM ('pending_review', 'approved', 'rejected', 'hidden');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add moderation columns to products table.
-- Default to 'pending_review' for genuinely new products going forward.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS moderation_status public.moderation_status DEFAULT 'pending_review'::public.moderation_status NOT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;


-- ──────────────────────────────────────────
-- C. BACKFILL EXISTING DATA
-- ──────────────────────────────────────────

-- CRITICAL: Backfill all existing sellers to 'approved' so they retain access.
UPDATE public.sellers SET status = 'approved' WHERE status = 'pending';

-- CRITICAL: Backfill all existing products to 'approved' so they remain visible.
UPDATE public.products SET moderation_status = 'approved' WHERE moderation_status = 'pending_review';


-- ──────────────────────────────────────────
-- D. ADMIN HELPER FUNCTION
-- ──────────────────────────────────────────

-- Secure, performant helper to check if the current authenticated user
-- has the 'admin' role. Used in RLS policies and server-side checks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'::public.user_role
  );
$$;


-- ──────────────────────────────────────────
-- E. INDEX FOR MODERATION QUERIES
-- ──────────────────────────────────────────

-- Index for admin moderation queue queries.
CREATE INDEX IF NOT EXISTS idx_products_moderation_status ON public.products(moderation_status);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON public.sellers(status);
