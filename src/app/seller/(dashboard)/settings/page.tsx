import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { SettingsForm } from "@/components/seller/settings-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SellerSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/seller/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: seller } = await supabase
    .from("sellers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile || !seller) {
    redirect("/");
  }

  const initialData = {
    fullName: profile.full_name || "",
    phone: profile.phone || null,
    storeName: seller.store_name || "",
    businessName: seller.business_name || null,
    businessType: seller.business_type || null,
    taxId: seller.tax_id || null,
  };

  return (
    <DashboardShell>
      <SectionHeader 
        title="Settings" 
        description="Manage your store details and personal profile." 
      />
      <div className="max-w-2xl">
        <SettingsForm initialData={initialData} />
      </div>
    </DashboardShell>
  );
}
