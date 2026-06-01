import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type OrderWithItems, type SellerOrderItem } from "@/types/database"

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
        setAll() {},
      },
    }
  )
}

// ─── Buyer: Fetch all orders ────────────────────────────────────────

const ORDER_WITH_ITEMS_QUERY = `
  *,
  addresses ( * ),
  order_items (
    *,
    products (
      name,
      slug,
      product_images ( image_url, is_primary )
    ),
    sellers (
      store_name
    )
  )
`

export async function fetchBuyerOrders(): Promise<OrderWithItems[]> {
  const supabase = await getClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_WITH_ITEMS_QUERY)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching buyer orders:", error)
    return []
  }

  return (data as unknown as OrderWithItems[]) || []
}

// ─── Buyer: Fetch single order ──────────────────────────────────────

export async function fetchOrderDetail(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await getClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_WITH_ITEMS_QUERY)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching order detail:", error)
    return null
  }

  return data as unknown as OrderWithItems
}

// ─── Seller: Fetch order items for this seller ──────────────────────

const SELLER_ORDER_ITEMS_QUERY = `
  *,
  products (
    name,
    slug,
    product_images ( image_url, is_primary )
  ),
  orders (
    id,
    order_status,
    payment_status,
    created_at,
    total_amount,
    profiles:user_id (
      full_name
    )
  )
`

export async function fetchSellerOrders(): Promise<SellerOrderItem[]> {
  const supabase = await getClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get seller record for this user
  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!seller) {
    return []
  }

  const { data, error } = await supabase
    .from("order_items")
    .select(SELLER_ORDER_ITEMS_QUERY)
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false, foreignTable: "orders" })

  if (error) {
    console.error("Error fetching seller orders:", error)
    return []
  }

  return (data as unknown as SellerOrderItem[]) || []
}

// ─── Seller: Fetch single order detail ──────────────────────────────

const SELLER_ORDER_DETAIL_QUERY = `
  *,
  addresses ( * ),
  profiles:user_id (
    full_name,
    phone
  ),
  order_items (
    *,
    products (
      name,
      slug,
      product_images ( image_url, is_primary )
    ),
    sellers (
      store_name
    )
  )
`

export async function fetchSellerOrderDetail(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await getClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get seller record
  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!seller) {
    return null
  }

  // Fetch the order — we verify seller ownership by checking order_items
  const { data, error } = await supabase
    .from("orders")
    .select(SELLER_ORDER_DETAIL_QUERY)
    .eq("id", orderId)
    .single()

  if (error || !data) {
    console.error("Error fetching seller order detail:", error)
    return null
  }

  // Verify this seller has at least one item in the order
  const orderData = data as unknown as OrderWithItems & { profiles: { full_name: string | null; phone: string | null } | null }
  const sellerHasItems = orderData.order_items.some(
    (item: { seller_id: string | null }) => item.seller_id === seller.id
  )

  if (!sellerHasItems) {
    return null
  }

  return orderData
}
