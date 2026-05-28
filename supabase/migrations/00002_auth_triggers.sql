-- ==========================================
-- SUPABASE AUTH TRIGGERS
-- ==========================================

-- Function to automatically create a profile (and seller record if applicable)
-- upon a new user registration via Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_role public.user_role;
BEGIN
  -- Default to 'buyer' if role is not specified or invalid
  BEGIN
    extracted_role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    extracted_role := 'buyer'::public.user_role;
  END;

  -- 1. Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    full_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    extracted_role
  );
  
  -- 2. If the user registered as a seller, insert into sellers table
  IF extracted_role = 'seller' THEN
    INSERT INTO public.sellers (
      user_id,
      store_name,
      status
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'store_name', NEW.raw_user_meta_data->>'full_name', 'My Store'),
      'pending'::public.seller_status
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to execute the function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
