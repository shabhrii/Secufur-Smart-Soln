-- ==========================================
-- RLS POLICIES FOR ORDERS & ORDER ITEMS
-- ==========================================

-- A. HELPER FUNCTIONS TO PREVENT RLS RECURSION
-- These functions run with SECURITY DEFINER (bypassing RLS).
-- This explicitly breaks the circular dependency between orders and order_items.

CREATE OR REPLACE FUNCTION public.is_buyer_of_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = p_order_id 
    AND user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_seller_items_in_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.order_items 
    JOIN public.sellers ON sellers.id = order_items.seller_id
    WHERE order_items.order_id = p_order_id 
    AND sellers.user_id = auth.uid()
  );
END;
$$;

-- B. CLEANUP EXISTING POLICIES (If re-running)
DROP POLICY IF EXISTS "Buyers can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders containing their items" ON public.orders;
DROP POLICY IF EXISTS "Buyers can insert items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Buyers can view items from their orders" ON public.order_items;
DROP POLICY IF EXISTS "Sellers can view order items for their products" ON public.order_items;


-- C. ORDERS POLICIES

-- 1. Orders: Buyers can create orders for themselves
CREATE POLICY "Buyers can insert their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. Orders: Buyers can read their own orders
CREATE POLICY "Buyers can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Orders: Sellers can read orders that contain their items
CREATE POLICY "Sellers can view orders containing their items"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_seller_items_in_order(id));


-- D. ORDER ITEMS POLICIES

-- 4. Order Items: Buyers can insert items for their own orders
CREATE POLICY "Buyers can insert items for their orders"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (public.is_buyer_of_order(order_id));

-- 5. Order Items: Buyers can read items from their own orders
CREATE POLICY "Buyers can view items from their orders"
ON public.order_items FOR SELECT
TO authenticated
USING (public.is_buyer_of_order(order_id));

-- 6. Order Items: Sellers can read order items for their products
CREATE POLICY "Sellers can view order items for their products"
ON public.order_items FOR SELECT
TO authenticated
USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
