"use server";

import { createClient } from "@/lib/supabase/server";
import { type LoginInput, type BuyerRegisterInput, type SellerRegisterInput } from "@/lib/validations/auth";
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
        role: ROLES.SELLER,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(ROUTES.SELLER.LOGIN);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.HOME);
}
