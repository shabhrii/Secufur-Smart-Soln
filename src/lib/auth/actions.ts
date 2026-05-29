"use server";

import { createClient } from "@/lib/supabase/server";
import { type LoginInput, type BuyerRegisterInput, type SellerRegisterInput, type UpgradeSellerInput } from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export async function signIn(data: LoginInput, redirectUrl: string = ROUTES.HOME) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectUrl);
}

export async function signUpBuyer(data: BuyerRegisterInput) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        role: ROLES.BUYER,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(ROUTES.AUTH.LOGIN);
}

export async function signUpSeller(data: SellerRegisterInput) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        store_name: data.storeName,
        business_name: data.businessName,
        business_type: data.businessType,
        tax_id: data.taxId,
        role: ROLES.SELLER,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(ROUTES.SELLER.LOGIN);
}

export async function upgradeBuyerToSeller(data: UpgradeSellerInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to upgrade your account." };
  }

  const { data: existingSeller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existingSeller) {
    const { error: sellerError } = await supabase.from("sellers").insert({
      user_id: user.id,
      store_name: data.storeName,
      business_name: data.businessName,
      business_type: data.businessType,
      tax_id: data.taxId,
      status: "pending"
    });

    if (sellerError) {
      return { error: sellerError.message };
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: ROLES.SELLER })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  redirect(ROUTES.SELLER.DASHBOARD);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.HOME);
}
