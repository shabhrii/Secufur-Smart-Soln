import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { ModerationTable } from "@/components/admin/moderation-table";
import { SellerApprovalCard } from "@/components/admin/seller-approval-card";
import { DollarSign, Users, Store, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  return (
    <DashboardShell>
      <SectionHeader 
        title="Platform Administration" 
        description="Global metrics and moderation queues for the entire marketplace." 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Gross Merchandise Value"
          value="$1.2M"
          icon={DollarSign}
          description="from last 30 days"
          trend="up"
          trendValue="+12.5%"
        />
        <AnalyticsCard
          title="Total Users"
          value="45,231"
          icon={Users}
          description="from last 30 days"
          trend="up"
          trendValue="+8.2%"
        />
        <AnalyticsCard
          title="Active Sellers"
          value="1,240"
          icon={Store}
          description="Verified businesses"
        />
        <AnalyticsCard
          title="Open Flags"
          value="24"
          icon={ShieldAlert}
          description="Requires attention"
          trend="down"
          trendValue="-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ModerationTable />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <SellerApprovalCard />
        </div>
      </div>
    </DashboardShell>
  );
}
