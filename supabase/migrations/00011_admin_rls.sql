-- ==========================================
-- ADMIN GLOBAL VISIBILITY (RLS)
-- ==========================================
-- Migration: 00011_admin_rls.sql
-- Purpose: Grants the 'admin' role global SELECT access to all
--          core tables, bypassing standard buyer/seller restrictions.
-- Note: This is purely additive. No existing policies are dropped.
-- ==========================================

-- 1. Profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- 2. Sellers
CREATE POLICY "Admins can view all sellers"
ON public.sellers FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. Products
CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT
TO authenticated
USING (public.is_admin());

-- 4. Orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.is_admin());

-- 5. Order Items
CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT
TO authenticated
USING (public.is_admin());

-- 6. Reviews (Already public, but explicit is better)
CREATE POLICY "Admins can view all reviews"
ON public.reviews FOR SELECT
TO authenticated
USING (public.is_admin());

-- 7. Seller Documents
CREATE POLICY "Admins can view all seller documents"
ON public.seller_documents FOR SELECT
TO authenticated
USING (public.is_admin());
