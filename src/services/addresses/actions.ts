"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const addressSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address_line_1: z.string().min(5, "Address must be at least 5 characters"),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  is_default: z.boolean().default(false)
})

export type AddressFormValues = z.infer<typeof addressSchema>

export async function fetchUserAddresses() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Ignore in server actions
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching addresses:", error)
    return []
  }

  return data
}

export async function createAddress(data: AddressFormValues) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Ignore in server actions
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "You must be logged in to add an address" }
  }

  const validatedData = addressSchema.safeParse(data)

  if (!validatedData.success) {
    return { success: false, error: "Invalid address data" }
  }

  // If this is the first address or marked as default, unset other defaults
  if (validatedData.data.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
  }

  const { error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      ...validatedData.data
    })

  if (error) {
    console.error("Error creating address:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/checkout")
  return { success: true }
}
