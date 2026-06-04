require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runAudit() {
  console.log("--- METRICS AUDIT ---");

  // 1. Users (Profiles)
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  console.log(`Total Profiles (Dashboard 'Total Users'): ${usersCount}`);

  const { count: buyersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer");
  console.log(`Total Buyers: ${buyersCount}`);

  const { count: sellersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller");
  console.log(`Total Sellers (by role): ${sellersCount}`);

  // 2. Active Sellers
  const { count: activeSellersCount } = await supabase.from("sellers").select("*", { count: "exact", head: true }).eq("status", "approved");
  console.log(`Active Sellers (Dashboard 'Active Sellers'): ${activeSellersCount}`);

  // 3. Pending Products
  const { count: pendingProductsCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("moderation_status", "pending_review");
  console.log(`Pending Products: ${pendingProductsCount}`);

  // 4. GMV Calculation (Dashboard style - limited to 1000)
  const { data: dashboardOrders } = await supabase.from("orders").select("total_amount").eq("payment_status", "paid");
  const dashboardGMV = dashboardOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
  console.log(`\nDashboard GMV (capped by 1000 limit): $${dashboardGMV}`);
  console.log(`Number of orders fetched by dashboard: ${dashboardOrders?.length}`);

  // 4b. GMV Actual (Paginated to get all)
  let actualGMV = 0;
  let hasMore = true;
  let page = 0;
  let totalOrders = 0;

  while (hasMore) {
    const { data: pageOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid")
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (pageOrders && pageOrders.length > 0) {
      actualGMV += pageOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      totalOrders += pageOrders.length;
      page++;
    } else {
      hasMore = false;
    }
  }
  console.log(`Actual GMV (all paid orders): $${actualGMV}`);
  console.log(`Total Paid Orders: ${totalOrders}`);

  // 5. Total Orders
  const { count: totalOrdersCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
  console.log(`\nTotal Orders (All statuses): ${totalOrdersCount}`);

  // 6. Products Approved Today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: approvedTodayCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("moderation_status", "approved")
    .gte("updated_at", startOfDay.toISOString());
  
  console.log(`Products Approved Today: ${approvedTodayCount}`);
}

runAudit().catch(console.error);
