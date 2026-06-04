import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { SellerApprovalCard } from "@/components/admin/seller-approval-card";
import { ApprovedSellersTable } from "@/components/admin/approved-sellers-table";
import { SuspendedSellersTable } from "@/components/admin/suspended-sellers-table";
import { getPendingSellers, getApprovedSellers, getSuspendedSellers } from "@/services/admin/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminSellersPage() {
  const [pendingSellers, approvedSellers, suspendedSellers] = await Promise.all([
    getPendingSellers(),
    getApprovedSellers(),
    getSuspendedSellers()
  ]);

  return (
    <DashboardShell>
      <SectionHeader
        title="Seller Management"
        description="Review pending applications, manage approvals, and monitor seller compliance."
      />
      <div className="grid gap-4">
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingSellers.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedSellers.length})
            </TabsTrigger>
            <TabsTrigger value="suspended">
              Suspended ({suspendedSellers.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <SellerApprovalCard sellers={pendingSellers as any} />
          </TabsContent>
          
          <TabsContent value="approved">
            <ApprovedSellersTable sellers={approvedSellers as any} />
          </TabsContent>
          
          <TabsContent value="suspended">
            <SuspendedSellersTable sellers={suspendedSellers as any} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

