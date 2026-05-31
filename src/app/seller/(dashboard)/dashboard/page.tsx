import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { DashboardStatsCard } from "@/components/seller/dashboard-stats-card";
import { OrdersTable } from "@/components/seller/orders-table";
import { RevenueCard } from "@/components/seller/revenue-card";
import { QuickActionsPanel } from "@/components/seller/quick-actions-panel";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { fetchSellerOrders } from "@/services/orders";
import { type OrderStatus } from "@/types/database";

export default async function SellerDashboard() {
  const sellerOrderItems = await fetchSellerOrders();

  // Group order items by order ID for the table
  const orderMap = new Map<string, {
    orderId: string;
    customerName: string;
    date: string;
    items: string[];
    total: number;
    status: OrderStatus;
  }>();

  for (const item of sellerOrderItems) {
    const orderId = item.orders?.id;
    if (!orderId) continue;

    if (!orderMap.has(orderId)) {
      orderMap.set(orderId, {
        orderId,
        customerName: item.orders?.profiles?.full_name || "Unknown Customer",
        date: item.orders?.created_at || "",
        items: [],
        total: 0,
        status: item.orders?.order_status || "pending",
      });
    }

    const orderRow = orderMap.get(orderId)!;
    orderRow.items.push(`${item.products?.name || "Product"} ×${item.quantity}`);
    orderRow.total += item.total_price;
  }

  const orders = Array.from(orderMap.values()).map(o => ({
    orderId: o.orderId,
    customerName: o.customerName,
    date: o.date,
    itemsSummary: o.items.join(", "),
    total: o.total,
    status: o.status,
  }));

  // Calculate stats from real data
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;

  return (
    <DashboardShell>
      <SectionHeader 
        title="Dashboard Overview" 
        description="Welcome back. Here's what's happening with your store today." 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="from all orders"
        />
        <DashboardStatsCard
          title="Active Orders"
          value={String(activeOrders)}
          icon={ShoppingBag}
          description="Pending or confirmed"
        />
        <DashboardStatsCard
          title="Total Orders"
          value={String(orders.length)}
          icon={Package}
          description="All time"
        />
        <DashboardStatsCard
          title="Avg. Order Value"
          value={orders.length > 0 ? `$${(totalRevenue / orders.length).toFixed(2)}` : "$0.00"}
          icon={TrendingUp}
          description="Per order"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <RevenueCard />
          <OrdersTable orders={orders.slice(0, 5)} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <QuickActionsPanel />
        </div>
      </div>
    </DashboardShell>
  );
}
