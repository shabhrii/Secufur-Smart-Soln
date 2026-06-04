"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type SettingsFormValues, settingsSchema } from "@/validations/settings";

/**
 * Validates if the current user is an admin.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  
  return supabase;
}

export async function getMarketplaceSettings() {
  const supabase = await requireAdmin();
  
  const { data, error } = await supabase
    .from("marketplace_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  // If table doesn't exist or row doesn't exist yet, return defaults safely
  if (error || !data) {
    return {
      name: "Secufur",
      commission_percentage: 10.0,
      maintenance_mode: false,
      support_email: "",
      contact_number: ""
    };
  }

  return data;
}

export async function updateMarketplaceSettings(data: SettingsFormValues) {
  const supabase = await requireAdmin();
  const validated = settingsSchema.parse(data);

  const { error } = await supabase
    .from("marketplace_settings")
    .upsert({
      id: 1,
      ...validated,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
