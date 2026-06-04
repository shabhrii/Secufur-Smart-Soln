import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { ModerationTable } from "@/components/admin/moderation-table";
import { SellerApprovalCard } from "@/components/admin/seller-approval-card";
import { DollarSign, Users, Store, ShieldAlert, TrendingUp, ShoppingCart, ShoppingBag, PackageSearch, CheckCircle } from "lucide-react";
import { getDashboardStats, getPendingSellers, getAdminProducts } from "@/services/admin/actions";
import { revalidatePath } from "next/cache";
import { suspendSeller, restoreSeller } from "@/services/admin/actions";

export default async function AdminDashboardPage() {
  const [stats, pendingSellers, pendingProducts] = await Promise.all([
    getDashboardStats(),
    getPendingSellers(),
    getAdminProducts("pending_review")
  ]);

  return (
    <DashboardShell>
      <SectionHeader 
        title="Platform Administration" 
        description="Global metrics and moderation queues for the entire marketplace." 
      />

      <div className="space-y-4">
        {/* Revenue Row */}
        <h3 className="text-lg font-medium">Revenue & Sales</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <AnalyticsCard
            title="Gross Merchandise Value"
            value={`$${stats.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Total active orders volume"
          />
          <AnalyticsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            description="Platform commissions earned"
          />
          <AnalyticsCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            description="All-time transactions"
          />
        </div>

        {/* Users Row */}
        <h3 className="text-lg font-medium pt-4">User Demographics</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <AnalyticsCard
            title="Total Users"
            value={stats.usersCount.toLocaleString()}
            icon={Users}
            description="All registered profiles"
          />
          <AnalyticsCard
            title="Total Buyers"
            value={stats.buyersCount.toLocaleString()}
            icon={ShoppingBag}
            description="Buyer accounts"
          />
          <AnalyticsCard
            title="Total Sellers"
            value={stats.sellersCount.toLocaleString()}
            icon={Store}
            description="Seller records"
          />
          <AnalyticsCard
            title="Active Sellers"
            value={stats.activeSellersCount.toLocaleString()}
            icon={Store}
            description="Approved businesses"
          />
        </div>

        {/* Moderation Row */}
        <h3 className="text-lg font-medium pt-4">Moderation & Queues</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <AnalyticsCard
            title="Pending Products"
            value={stats.pendingProductsCount.toString()}
            icon={PackageSearch}
            description="Products awaiting review"
            trend={stats.pendingProductsCount > 0 ? "up" : "neutral"}
          />
          <AnalyticsCard
            title="Products Approved Today"
            value={stats.productsApprovedToday.toString()}
            icon={CheckCircle}
            description="Vetted since midnight"
          />
          <AnalyticsCard
            title="Open Flags"
            value={stats.pendingFlagsCount.toString()}
            icon={ShieldAlert}
            description="Total items requiring attention"
            trend={stats.pendingFlagsCount > 0 ? "up" : "neutral"}
            trendValue={stats.pendingFlagsCount > 0 ? "Action Needed" : "All clear"}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ModerationTable products={pendingProducts as any} currentTab="pending_review" />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <SellerApprovalCard sellers={pendingSellers as any} />
        </div>
      </div>
    </DashboardShell>
  );
}
