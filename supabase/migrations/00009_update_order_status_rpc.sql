-- ==========================================
-- ATOMIC ORDER STATUS UPDATE & CANCEL WITH STOCK RESTORE
-- ==========================================

-- RPC function to update order status with validation and atomic stock restoration on cancellation.
-- Called by the seller fulfillment Server Action.

CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_seller_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_current_status TEXT;
  v_item RECORD;
  v_seller_has_items BOOLEAN;
BEGIN
  -- 1. Fetch and lock the order row
  SELECT id, order_status::TEXT INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found.');
  END IF;

  v_current_status := v_order.order_status;

  -- 2. Verify seller owns at least one item in this order
  SELECT EXISTS(
    SELECT 1 FROM public.order_items
    WHERE order_id = p_order_id AND seller_id = p_seller_id
  ) INTO v_seller_has_items;

  IF NOT v_seller_has_items THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not have items in this order.');
  END IF;

  -- 3. Validate status transitions
  IF v_current_status = 'delivered' OR v_current_status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot update a ' || v_current_status || ' order.');
  END IF;

  IF NOT (
    (v_current_status = 'pending' AND p_new_status IN ('confirmed', 'cancelled')) OR
    (v_current_status = 'confirmed' AND p_new_status IN ('shipped', 'cancelled')) OR
    (v_current_status = 'shipped' AND p_new_status = 'delivered')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 
      'Invalid transition from ' || v_current_status || ' to ' || p_new_status || '.');
  END IF;

  -- 4. If cancelling, restore stock for every order item
  IF p_new_status = 'cancelled' THEN
    FOR v_item IN
      SELECT product_id, quantity FROM public.order_items
      WHERE order_id = p_order_id
    LOOP
      UPDATE public.products
      SET stock_quantity = stock_quantity + v_item.quantity
      WHERE id = v_item.product_id;
    END LOOP;
  END IF;

  -- 5. Update order status
  UPDATE public.orders
  SET order_status = p_new_status::public.order_status,
      updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
