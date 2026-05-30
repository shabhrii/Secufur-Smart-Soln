-- ==========================================
-- ENSURE SELLERS HAVE FULL CRUD ACCESS TO THEIR OWN PRODUCTS
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Ensure Sellers can view ALL of their own products (including drafts)
DROP POLICY IF EXISTS "Sellers can view their own products" ON public.products;
CREATE POLICY "Sellers can view their own products" 
ON public.products FOR SELECT 
TO authenticated 
USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- 2. Ensure Sellers can UPDATE their own products
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
TO authenticated
USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
)
WITH CHECK (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- 3. Ensure Sellers can DELETE their own products
DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;
CREATE POLICY "Sellers can delete their own products"
ON public.products FOR DELETE
TO authenticated
USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
