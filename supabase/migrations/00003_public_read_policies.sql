-- ==========================================
-- RLS POLICIES FOR PUBLIC BUYER BROWSING
-- ==========================================

-- 1. Categories (Everyone can read categories)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

-- 2. Products (Everyone can read active products)
CREATE POLICY "Active products are viewable by everyone" 
ON public.products FOR SELECT 
USING (status = 'active'::public.product_status);

-- 3. Product Images (Everyone can read images of active products)
CREATE POLICY "Product images are viewable by everyone" 
ON public.product_images FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_images.product_id
    AND products.status = 'active'::public.product_status
  )
);

-- 4. Sellers (Everyone can read approved sellers profiles)
CREATE POLICY "Approved sellers are viewable by everyone" 
ON public.sellers FOR SELECT 
USING (status = 'approved'::public.seller_status);

-- 5. Reviews (Everyone can read reviews)
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);
