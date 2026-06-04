import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { ModerationTable } from "@/components/admin/moderation-table";
import { getAdminProducts } from "@/services/admin/actions";
import { ProductsTabsClient } from "./client";

export default async function AdminProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ seller?: string; tab?: string }> 
}) {
  const params = await searchParams;
  const sellerId = params.seller;
  const tab = params.tab || "pending_review";
  const adminProducts = await getAdminProducts(tab, sellerId);

  return (
    <DashboardShell>
      <SectionHeader
        title={sellerId ? "Seller Products Moderation" : "Product Moderation"}
        description={sellerId ? "Review products submitted by this specific seller." : "Review, approve, or reject products submitted by sellers."}
      />
      
      <ProductsTabsClient initialTab={tab} />

      <div className="grid gap-4">
        <ModerationTable products={adminProducts as any} currentTab={tab} />
      </div>
    </DashboardShell>
  );
}
