require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log("Checking create_order_with_stock...");
  const { error: err1 } = await supabase.rpc('create_order_with_stock', { p_address_id: 'bad', p_items: [] });
  console.log("create_order_with_stock:", err1 ? err1.message : "Exists");
}

check();
