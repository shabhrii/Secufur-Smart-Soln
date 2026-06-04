require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  console.log("=== RUNTIME VERIFICATION ===");
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = url.match(/https:\/\/(.*)\.supabase\.co/)[1];

  console.log("1. ENVIRONMENT VARIABLES");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", url);
  console.log("Project Reference ID:", projectRef);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("\n2. QUERYING pg_proc via REST (expected to fail unless explicitly exposed)");
  const { data: procData, error: procError } = await supabase
    .from('pg_proc')
    .select('proname')
    .eq('proname', 'update_order_status');
    
  if (procError) {
    console.log("Error querying pg_proc:", procError.message);
  } else {
    console.log("pg_proc result:", procData);
  }

  console.log("\n3. RUNTIME RPC INVOCATION");
  console.log("Executing: supabase.rpc('update_order_status', { p_order_id: 'bad', p_new_status: 'shipped', p_seller_id: 'bad' })");
  const { data: rpcData, error: rpcError } = await supabase.rpc('update_order_status', {
    p_order_id: '00000000-0000-0000-0000-000000000000',
    p_new_status: 'shipped',
    p_seller_id: '00000000-0000-0000-0000-000000000000'
  });

  if (rpcError) {
    console.log("RUNTIME RPC RESULT: FAIL");
    console.log("Error Details:", rpcError);
  } else {
    console.log("RUNTIME RPC RESULT: PASS");
    console.log("Data:", rpcData);
  }

}

run().catch(console.error);
