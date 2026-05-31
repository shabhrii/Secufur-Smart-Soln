-- ==========================================
-- ATOMIC ORDER CREATION & INVENTORY
-- ==========================================

-- 1. Add strict check constraint to prevent negative stock at the database level
ALTER TABLE public.products
ADD CONSTRAINT check_stock_non_negative CHECK (stock_quantity >= 0);

-- 2. Create the RPC function to handle atomic order creation
CREATE OR REPLACE FUNCTION create_order_with_stock(
  p_address_id UUID,
  p_items JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_address_id UUID;
  v_item RECORD;
  v_product RECORD;
  v_stock_errors JSONB := '[]'::JSONB;
  v_order_items JSONB := '[]'::JSONB;
  v_subtotal NUMERIC(10,2) := 0;
  v_shipping_cost NUMERIC(10,2) := 15.00;
  v_total NUMERIC(10,2);
  v_order_id UUID;
BEGIN
  -- 1. Authenticate user internally
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must be logged in to place an order.');
  END IF;

  -- 2. Verify address belongs to the user
  SELECT id INTO v_address_id 
  FROM public.addresses 
  WHERE id = p_address_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid shipping address.');
  END IF;

  -- 3. Validate items and lock rows sequentially to prevent race conditions
  -- (Sorting by product ID to prevent deadlocks if multiple concurrent transactions buy the same items)
  FOR v_item IN (
    SELECT * FROM jsonb_to_recordset(p_items) AS x("productId" UUID, quantity INT)
    ORDER BY "productId"
  )
  LOOP
    -- FOR UPDATE locks the row until this transaction completes or rolls back
    SELECT id, name, price, stock_quantity, seller_id, status 
    INTO v_product 
    FROM public.products 
    WHERE id = v_item."productId" 
    FOR UPDATE;

    IF NOT FOUND THEN
      v_stock_errors := v_stock_errors || jsonb_build_object(
        'productId', v_item."productId",
        'productName', 'Unknown product',
        'available', 0,
        'requested', v_item.quantity
      );
      CONTINUE;
    END IF;

    IF v_product.status != 'active' THEN
      v_stock_errors := v_stock_errors || jsonb_build_object(
        'productId', v_item."productId",
        'productName', v_product.name,
        'available', 0,
        'requested', v_item.quantity
      );
      CONTINUE;
    END IF;

    IF v_product.stock_quantity < v_item.quantity THEN
      v_stock_errors := v_stock_errors || jsonb_build_object(
        'productId', v_item."productId",
        'productName', v_product.name,
        'available', v_product.stock_quantity,
        'requested', v_item.quantity
      );
      CONTINUE;
    END IF;

    -- Accumulate valid items for insertion later
    v_order_items := v_order_items || jsonb_build_object(
      'productId', v_item."productId",
      'sellerId', v_product.seller_id,
      'quantity', v_item.quantity,
      'unitPrice', v_product.price,
      'totalPrice', v_product.price * v_item.quantity
    );
    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);

  END LOOP;

  -- 4. If any stock errors occurred, return them immediately without committing anything
  IF jsonb_array_length(v_stock_errors) > 0 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Some items are out of stock or unavailable.', 
      'stockErrors', v_stock_errors
    );
  END IF;

  -- 5. Calculate total
  v_total := v_subtotal + v_shipping_cost;

  -- 6. Insert Order
  INSERT INTO public.orders (
    user_id, address_id, order_status, payment_status, subtotal, shipping_cost, total_amount
  ) VALUES (
    v_user_id, v_address_id, 'pending', 'pending', v_subtotal, v_shipping_cost, v_total
  ) RETURNING id INTO v_order_id;

  -- 7. Insert Order Items and Update Stock Atomically
  FOR v_item IN SELECT * FROM jsonb_to_recordset(v_order_items) AS x(
    "productId" UUID,
    "sellerId" UUID,
    quantity INT,
    "unitPrice" NUMERIC,
    "totalPrice" NUMERIC
  )
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, seller_id, quantity, unit_price, total_price
    ) VALUES (
      v_order_id, v_item."productId", v_item."sellerId", v_item.quantity, v_item."unitPrice", v_item."totalPrice"
    );

    UPDATE public.products 
    SET stock_quantity = stock_quantity - v_item.quantity 
    WHERE id = v_item."productId";
  END LOOP;

  -- 8. Return success response with order ID
  RETURN jsonb_build_object('success', true, 'orderId', v_order_id);

END;
$$;
