const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function runTests() {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  // We can query pg_policies using the admin client if we use a raw SQL function, 
  // but we don't have one.
  // Wait, does PostgREST expose pg_catalog? No.
  
  // Can we just try to fetch orders using the admin key?
  // Service role key bypasses RLS.
  const { data, error } = await adminClient.from('orders').select('*').limit(1)
  console.log("Admin fetch orders:", data ? "SUCCESS" : error)
}
runTests()
