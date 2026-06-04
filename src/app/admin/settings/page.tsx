import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { SettingsFormClient } from "./client";
import { getMarketplaceSettings } from "@/services/admin/settings";

export default async function AdminSettingsPage() {
  const settings = await getMarketplaceSettings();

  return (
    <DashboardShell>
      <SectionHeader
        title="Marketplace Settings"
        description="Manage global configuration, commissions, and maintenance mode."
      />
      <div className="mt-2">
        <SettingsFormClient initialData={settings} />
      </div>
    </DashboardShell>
  );
}
