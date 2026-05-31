"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// ─── Helpers ────────────────────────────────────────────────────────

async function getClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Ignored in server actions
        },
      },
    }
  )
}

// ─── Types ──────────────────────────────────────────────────────────

interface CreateOrderInput {
  addressId: string
  items: {
    productId: string
    quantity: number
  }[]
}

interface CreateOrderResult {
  success: boolean
  orderId?: string
  error?: string
  stockErrors?: { productId: string; productName: string; available: number; requested: number }[]
}

// ─── Create Order ───────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = await getClient()

  // 1. Authenticate (mostly to fail fast before calling RPC)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "You must be logged in to place an order." }
  }

  // 2. Validate input
  if (!input.addressId || !input.items || input.items.length === 0) {
    return { success: false, error: "Address and at least one item are required." }
  }

  // 3. Call the atomic PostgreSQL RPC function
  // The RPC handles stock validation, locking, calculations, and inserts in a single transaction
  const { data, error } = await supabase.rpc("create_order_with_stock", {
    p_address_id: input.addressId,
    p_items: input.items,
  })

  if (error) {
    console.error("RPC Error creating order:", error)
    return { success: false, error: "Failed to create order. Please try again." }
  }

  // The RPC returns a JSON object matching the CreateOrderResult interface
  const result = data as unknown as CreateOrderResult

  // 4. Revalidate cache if successful
  if (result.success) {
    revalidatePath("/orders")
    revalidatePath("/seller/orders")
    revalidatePath("/seller/dashboard")
  }

  return result
}
