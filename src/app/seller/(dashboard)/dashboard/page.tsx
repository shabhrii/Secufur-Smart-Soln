import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { DashboardStatsCard } from "@/components/seller/dashboard-stats-card";
import { OrdersTable } from "@/components/seller/orders-table";
import { RevenueCard } from "@/components/seller/revenue-card";
import { QuickActionsPanel } from "@/components/seller/quick-actions-panel";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";

export default function SellerDashboard() {
  return (
    <DashboardShell>
      <SectionHeader 
        title="Dashboard Overview" 
        description="Welcome back. Here's what's happening with your store today." 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatsCard
          title="Total Revenue"
          value="$12,345.00"
          icon={DollarSign}
          description="from last month"
          trend="up"
          trendValue="+14.5%"
        />
        <DashboardStatsCard
          title="Active Orders"
          value="42"
          icon={ShoppingBag}
          description="Requires processing"
        />
        <DashboardStatsCard
          title="Total Products"
          value="128"
          icon={Package}
          description="Active listings"
        />
        <DashboardStatsCard
          title="Conversion Rate"
          value="3.2%"
          icon={TrendingUp}
          description="from last month"
          trend="up"
          trendValue="+0.4%"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <RevenueCard />
          <OrdersTable />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <QuickActionsPanel />
        </div>
      </div>
    </DashboardShell>
  );
}
