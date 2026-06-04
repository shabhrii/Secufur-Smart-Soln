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

const PRODUCT_SELECT_QUERY = `
  *,
  categories ( id, name, slug ),
  sellers ( id, store_name, logo_url ),
  product_images ( id, image_url, is_primary, sort_order )
`

export async function fetchFeaturedProducts(limit = 10): Promise<Product[]> {
  const supabase = await getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT_QUERY)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .eq("featured", true)
    .limit(limit)

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return data as unknown as Product[]
}

export async function fetchAllProducts({ 
  limit = 20, 
  offset = 0,
  categorySlug = null,
  searchQuery = null,
  sortBy = "created_at",
  sortOrder = "desc"
}: {
  limit?: number;
  offset?: number;
  categorySlug?: string | null;
  searchQuery?: string | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{ products: Product[], count: number }> {
  const supabase = await getClient()
  
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT_QUERY, { count: 'exact' })
    .eq("status", "active")
    .eq("moderation_status", "approved")

  if (categorySlug) {
    // First fetch the category to get its ID
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()
      
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`)
  }

  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error("Error fetching all products:", error)
    return { products: [], count: 0 }
  }

  return { 
    products: data as unknown as Product[], 
    count: count || 0 
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT_QUERY)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error(`Error fetching product with slug ${slug}:`, error)
    return null
  }

  return data as unknown as Product
}
