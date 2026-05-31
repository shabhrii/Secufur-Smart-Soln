const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function runTests() {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const buyerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    const buyerEmail = `buyer_rls_${Date.now()}@test.com`
    const { data: buyerData } = await adminClient.auth.admin.createUser({
      email: buyerEmail,
      password: 'Password123!',
      email_confirm: true
    })
    const buyerId = buyerData.user.id
    await buyerClient.auth.signInWithPassword({ email: buyerEmail, password: 'Password123!' })

    // Try to insert an order
    const { data, error } = await buyerClient.from('orders').insert({
      user_id: buyerId,
      subtotal: 10,
      shipping_cost: 0,
      total_amount: 10,
      order_status: 'pending',
      payment_status: 'pending'
    }).select()

    if (error && error.code === '42501') { // 42501 is Postgres Insufficient Privilege (RLS violation)
      console.log("❌ NO POLICIES APPLIED: Row-Level Security blocked the insert.")
    } else if (error) {
       console.log("❌ DIFFERENT ERROR:", error.message)
    } else {
      console.log("✅ POLICIES APPLIED: Insert succeeded.", data)
      // Clean up the order we just created
      await adminClient.from('orders').delete().eq('id', data[0].id)
    }

    await adminClient.auth.admin.deleteUser(buyerId)
  } catch(e) {
    console.error(e)
  }
}
runTests()
