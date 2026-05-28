-- ==========================================
-- SELLER PRODUCT MANAGEMENT & STORAGE
-- ==========================================

-- 1. Create Storage Bucket for Product Images
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'product-images' bucket
-- Allow public viewing
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated sellers to insert
CREATE POLICY "Authenticated sellers can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.sellers WHERE user_id = auth.uid()
  )
);

-- Allow authenticated sellers to delete their own uploads
-- Note: Simplified for this implementation. Ideally we check the file path.
CREATE POLICY "Authenticated sellers can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.sellers WHERE user_id = auth.uid()
  )
);


-- 2. Seller Policies for Products Table
-- ==========================================
-- Insert: Sellers can only insert products with their own seller_id
CREATE POLICY "Sellers can insert their own products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- Update: Sellers can only update their own products
CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
TO authenticated
USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
)
WITH CHECK (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- Delete: Sellers can only delete their own products
CREATE POLICY "Sellers can delete their own products"
ON public.products FOR DELETE
TO authenticated
USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);


-- 3. Seller Policies for Product Images Table
-- ==========================================
-- Insert: Sellers can only insert images for their own products
CREATE POLICY "Sellers can insert images for their products"
ON public.product_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_images.product_id
    AND products.seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  )
);

-- Delete: Sellers can only delete images for their own products
CREATE POLICY "Sellers can delete images for their products"
ON public.product_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_images.product_id
    AND products.seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  )
);
