import { createServerClient } from "@supabase/ssr"
import { env } from "@/env"
import { cookies } from "next/headers"
import { type Product } from "@/types/database"

async function getClient() {
  const cookieStore = await cookies()
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {}
      }
    }
  )
}

export async function fetchSellerProducts(): Promise<Product[]> {
  const supabase = await getClient()
  
  // RLS will automatically filter this to only the authenticated seller's products
  // based on the policy we added. Wait, we need to join with sellers to get the seller ID,
  // or we can fetch the user's seller_id first.
  
  // First get the user's seller profile
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return []

  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", userData.user.id)
    .single()

  if (!seller) return []

  // Then fetch their products
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories ( id, name ),
      product_images ( id, image_url, is_primary )
    `)
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching seller products:", error)
    return []
  }

  return data as unknown as Product[]
}

export async function fetchSellerProductById(productId: string): Promise<Product | null> {
  const supabase = await getClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", userData.user.id)
    .single()

  if (!seller) return null

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories ( id, name ),
      product_images ( id, image_url, is_primary, sort_order )
    `)
    .eq("id", productId)
    .eq("seller_id", seller.id)
    .single()

  if (error) {
    console.error(`Error fetching seller product ${productId}:`, error)
    return null
  }

  return data as unknown as Product
}
