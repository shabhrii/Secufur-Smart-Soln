const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function runTests() {
  console.log("Starting End-to-End Smoke Tests...\n")
  let passed = true;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const buyerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const sellerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const otherBuyerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // --- SETUP TEST DATA ---
    console.log("Setting up test data...")
    
    // 1. Create Buyer User
    const buyerEmail = `buyer_${Date.now()}@test.com`
    const { data: buyerData, error: buyerErr } = await adminClient.auth.admin.createUser({
      email: buyerEmail,
      password: 'Password123!',
      email_confirm: true
    })
    if (buyerErr) throw new Error(`Buyer creation failed: ${buyerErr.message}`)
    const buyerId = buyerData.user.id
    
    // 2. Create Other Buyer User
    const otherEmail = `other_${Date.now()}@test.com`
    const { data: otherData } = await adminClient.auth.admin.createUser({
      email: otherEmail,
      password: 'Password123!',
      email_confirm: true
    })
    const otherBuyerId = otherData.user.id

    // 3. Create Seller User
    const sellerEmail = `seller_${Date.now()}@test.com`
    const { data: sellerData } = await adminClient.auth.admin.createUser({
      email: sellerEmail,
      password: 'Password123!',
      email_confirm: true
    })
    const sellerUserId = sellerData.user.id

    // Create Seller Profile in public.sellers
    const { data: sellerRecord, error: sellerRecordErr } = await adminClient.from('sellers').insert({
      user_id: sellerUserId,
      store_name: 'Test Store',
      description: 'Test Description',
      status: 'approved'
    }).select().single()
    if (sellerRecordErr) throw new Error(`Seller record creation failed: ${sellerRecordErr.message}`)
    const sellerId = sellerRecord.id

    // 4. Create Product
    const initialStock = 10;
    const { data: product, error: prodErr } = await adminClient.from('products').insert({
      seller_id: sellerId,
      name: 'Test Product',
      slug: `test-product-${Date.now()}`,
      description: 'Test',
      price: 100.00,
      stock_quantity: initialStock,
      status: 'active'
    }).select().single()
    if (prodErr) throw new Error(`Product creation failed: ${prodErr.message}`)
    const productId = product.id

    // 5. Create Buyer Address
    const { data: address, error: addrErr } = await adminClient.from('addresses').insert({
      user_id: buyerId,
      full_name: 'Test Buyer',
      address_line_1: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      postal_code: '12345',
      country: 'Test Country',
      is_default: true
    }).select().single()
    if (addrErr) throw new Error(`Address creation failed: ${addrErr.message}`)
    const addressId = address.id

    // 6. Sign In Clients
    await buyerClient.auth.signInWithPassword({ email: buyerEmail, password: 'Password123!' })
    await otherBuyerClient.auth.signInWithPassword({ email: otherEmail, password: 'Password123!' })
    await sellerClient.auth.signInWithPassword({ email: sellerEmail, password: 'Password123!' })

    console.log("Setup complete.\n")

    // --- SCENARIO 1: Normal Purchase ---
    console.log("Scenario 1: Normal Purchase & Visibility")
    let s1Passed = false;
    const { data: rpcRes1, error: rpcErr1 } = await buyerClient.rpc('create_order_with_stock', {
      p_address_id: addressId,
      p_items: [{ productId, quantity: 2 }]
    })
    
    if (rpcErr1) {
      console.log(`  FAIL: RPC threw error: ${rpcErr1.message}`)
    } else if (!rpcRes1.success) {
      console.log(`  FAIL: RPC returned failure: ${rpcRes1.error}`)
      console.log(JSON.stringify(rpcRes1.stockErrors, null, 2))
    } else {
      const orderId = rpcRes1.orderId
      
      // Check stock reduction
      const { data: pAfter } = await adminClient.from('products').select('stock_quantity').eq('id', productId).single()
      const stockCorrect = pAfter.stock_quantity === (initialStock - 2)
      
      // Check buyer visibility
      const { data: buyerOrders, error: bErr } = await buyerClient.from('orders').select('id').eq('id', orderId)
      if (bErr) throw new Error("buyerOrders query failed: " + bErr.message)
      const buyerVisible = buyerOrders && buyerOrders.length === 1
      
      // Check seller visibility
      const { data: sellerItems, error: sErr } = await sellerClient.from('order_items').select('id').eq('order_id', orderId)
      if (sErr) throw new Error("sellerItems query failed: " + sErr.message)
      const sellerVisible = sellerItems && sellerItems.length === 1

      if (stockCorrect && buyerVisible && sellerVisible) {
        console.log("  PASS")
        s1Passed = true;
      } else {
        console.log(`  FAIL: stockCorrect=${stockCorrect}, buyerVisible=${buyerVisible}, sellerVisible=${sellerVisible}`)
      }
    }
    if (!s1Passed) passed = false;

    // --- SCENARIO 2: Overselling ---
    console.log("\nScenario 2: Attempt to purchase more than available stock")
    let s2Passed = false;
    // Current stock is 8. Try to buy 10.
    const { data: rpcRes2, error: rpcErr2 } = await buyerClient.rpc('create_order_with_stock', {
      p_address_id: addressId,
      p_items: [{ productId, quantity: 10 }]
    })
    
    if (rpcErr2) {
      console.log("  PASS (Threw SQL exception, transaction aborted)")
      s2Passed = true;
    } else if (rpcRes2 && !rpcRes2.success && rpcRes2.stockErrors?.length > 0) {
      console.log("  PASS (Gracefully rejected via stock validation JSON response)")
      s2Passed = true;
    } else {
      console.log("  FAIL: Order went through or different error structure")
      console.log(rpcRes2)
    }
    if (!s2Passed) passed = false;

    // --- SCENARIO 3: RLS Isolation ---
    console.log("\nScenario 3: Attempt direct access to another user's order")
    let s3Passed = false;
    const targetOrderId = rpcRes1?.orderId
    if (targetOrderId) {
      const { data: snoopedOrders, error: snoopErr } = await otherBuyerClient.from('orders').select('*').eq('id', targetOrderId)
      if (snoopedOrders && snoopedOrders.length === 0) {
        console.log("  PASS (0 rows returned)")
        s3Passed = true;
      } else {
        console.log(`  FAIL: Returned ${snoopedOrders?.length} rows. Expected 0.`)
      }
    } else {
      console.log("  FAIL: Could not test due to Scenario 1 failure.")
    }
    if (!s3Passed) passed = false;

    // --- SCENARIO 4: Multiple Orders Stock Consistency ---
    console.log("\nScenario 4: Place multiple orders for same product")
    let s4Passed = false;
    // Current stock is 8.
    const { data: rpcRes4, error: rpcErr4 } = await buyerClient.rpc('create_order_with_stock', {
      p_address_id: addressId,
      p_items: [{ productId, quantity: 3 }]
    })
    
    if (rpcRes4?.success) {
      const { data: pFinal } = await adminClient.from('products').select('stock_quantity').eq('id', productId).single()
      if (pFinal.stock_quantity === 5) {
        console.log("  PASS (Stock correctly updated sequentially: 10 -> 8 -> 5)")
        s4Passed = true;
      } else {
        console.log(`  FAIL: Expected stock to be 5, got ${pFinal.stock_quantity}`)
      }
    } else {
      console.log("  FAIL: Second order failed unexpectedly.")
    }
    if (!s4Passed) passed = false;

    // --- CLEANUP ---
    console.log("\nCleaning up test data...")
    await adminClient.auth.admin.deleteUser(buyerId)
    await adminClient.auth.admin.deleteUser(otherBuyerId)
    await adminClient.auth.admin.deleteUser(sellerUserId)
    
    if (passed) {
      console.log("\n✅ ALL END-TO-END TESTS PASSED.")
    } else {
      console.log("\n❌ ONE OR MORE TESTS FAILED.")
    }

  } catch (error) {
    console.error("Test execution failed:", error)
  }
}

runTests()
