const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runAudit() {
  console.log("--- TRUE DB COUNTS (BYPASSING RLS) ---");
  
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  console.log("Total Profiles:", usersCount);

  const { count: activeSellersCount } = await supabase.from("sellers").select("*", { count: "exact", head: true }).eq("status", "approved");
  console.log("Active Sellers:", activeSellersCount);

  const { count: pendingSellersCount } = await supabase.from("sellers").select("*", { count: "exact", head: true }).eq("status", "pending");
  console.log("Pending Sellers:", pendingSellersCount);

  const { count: pendingProductsCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("moderation_status", "pending_review");
  console.log("Pending Products:", pendingProductsCount);

  const { data: orders } = await supabase.from("orders").select("total_amount").eq("payment_status", "paid");
  const gmv = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
  console.log("GMV (Total Paid Orders):", gmv);
  console.log("Total Paid Orders Count:", orders?.length || 0);

  const { count: totalOrdersCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
  console.log("Total Orders:", totalOrdersCount);
}

runAudit().catch(console.error);
