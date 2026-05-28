-- ==========================================
-- RLS POLICIES FOR BUYER ADDRESSES
-- ==========================================

-- 1. Addresses (Buyers can manage their own addresses)
-- Select: Users can read their own addresses
CREATE POLICY "Users can view their own addresses" 
ON public.addresses FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Insert: Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses" 
ON public.addresses FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Update: Users can update their own addresses
CREATE POLICY "Users can update their own addresses" 
ON public.addresses FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Delete: Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses" 
ON public.addresses FOR DELETE 
TO authenticated
USING (user_id = auth.uid());
