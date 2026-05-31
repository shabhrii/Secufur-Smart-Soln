"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sellerSettingsSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  phone: z.string().optional().nullable(),
  storeName: z.string().min(2, "Store name is too short"),
  businessName: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
});

export type SellerSettingsInput = z.infer<typeof sellerSettingsSchema>;

export async function updateSellerProfile(data: SellerSettingsInput) {
  try {
    // Validate input
    const parsed = sellerSettingsSchema.parse(data);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Update profiles table (fullName, phone)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.fullName,
        phone: parsed.phone,
      })
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: "Failed to update profile details: " + profileError.message };
    }

    // 2. Update sellers table (storeName, businessName, businessType, taxId)
    const { error: sellerError } = await supabase
      .from("sellers")
      .update({
        store_name: parsed.storeName,
        business_name: parsed.businessName,
        business_type: parsed.businessType,
        tax_id: parsed.taxId,
      })
      .eq("user_id", user.id);

    if (sellerError) {
      return { success: false, error: "Failed to update store details: " + sellerError.message };
    }

    revalidatePath("/seller/settings");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
