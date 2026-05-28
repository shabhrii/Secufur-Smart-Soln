"use server"

import { createServerClient } from "@supabase/ssr"
import { env } from "@/env"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      }
    }
  )
}

// ----------------------------------------
// Validation Schemas
// ----------------------------------------
export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category_id: z.string().min(1, "Category is required"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  compare_at_price: z.coerce.number().optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  images: z.array(z.string().url()).optional()
})

export type ProductFormValues = z.infer<typeof productSchema>

// ----------------------------------------
// Actions
// ----------------------------------------

async function getSellerId(supabase: any) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error("Unauthorized")

  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", userData.user.id)
    .single()

  if (!seller) throw new Error("Seller profile not found")
  return seller.id
}

export async function createProduct(data: ProductFormValues) {
  try {
    const supabase = await getClient()
    const sellerId = await getSellerId(supabase)

    // Validate incoming data
    const validatedData = productSchema.parse(data)

    // 1. Insert Product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        seller_id: sellerId,
        category_id: validatedData.category_id,
        name: validatedData.name,
        slug: validatedData.slug,
        short_description: validatedData.short_description || null,
        description: validatedData.description || null,
        price: validatedData.price,
        compare_at_price: validatedData.compare_at_price || null,
        stock_quantity: validatedData.stock_quantity,
        sku: validatedData.sku || null,
        status: validatedData.status,
        featured: validatedData.featured,
      })
      .select("id")
      .single()

    if (productError) throw new Error(`Product creation failed: ${productError.message}`)

    // 2. Insert Images (if any)
    if (validatedData.images && validatedData.images.length > 0) {
      const imageRecords = validatedData.images.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        is_primary: index === 0,
        sort_order: index,
      }))

      const { error: imageError } = await supabase
        .from("product_images")
        .insert(imageRecords)

      if (imageError) throw new Error(`Image linking failed: ${imageError.message}`)
    }

    revalidatePath("/seller/products")
    revalidatePath("/products")
    
    return { success: true, productId: product.id }
  } catch (error: any) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message || "Failed to create product" }
  }
}

export async function updateProduct(productId: string, data: ProductFormValues) {
  try {
    const supabase = await getClient()
    const sellerId = await getSellerId(supabase)

    // Validate incoming data
    const validatedData = productSchema.parse(data)

    // 1. Update Product (RLS ensures they can only update their own)
    const { error: productError } = await supabase
      .from("products")
      .update({
        category_id: validatedData.category_id,
        name: validatedData.name,
        slug: validatedData.slug,
        short_description: validatedData.short_description || null,
        description: validatedData.description || null,
        price: validatedData.price,
        compare_at_price: validatedData.compare_at_price || null,
        stock_quantity: validatedData.stock_quantity,
        sku: validatedData.sku || null,
        status: validatedData.status,
        featured: validatedData.featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("seller_id", sellerId)

    if (productError) throw new Error(`Product update failed: ${productError.message}`)

    // 2. Handle Images: For simplicity, delete existing and re-insert
    if (validatedData.images) {
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId)

      if (validatedData.images.length > 0) {
        const imageRecords = validatedData.images.map((url, index) => ({
          product_id: productId,
          image_url: url,
          is_primary: index === 0,
          sort_order: index,
        }))

        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageRecords)

        if (imageError) throw new Error(`Image linking failed: ${imageError.message}`)
      }
    }

    revalidatePath("/seller/products")
    revalidatePath(`/products`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Error updating product:", error)
    return { success: false, error: error.message || "Failed to update product" }
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await getClient()
    const sellerId = await getSellerId(supabase)

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("seller_id", sellerId)

    if (error) throw new Error(`Failed to delete product: ${error.message}`)

    revalidatePath("/seller/products")
    revalidatePath("/products")
    
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting product:", error)
    return { success: false, error: error.message || "An error occurred" }
  }
}

export async function archiveProduct(productId: string) {
  try {
    const supabase = await getClient()
    const sellerId = await getSellerId(supabase)

    const { error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("id", productId)
      .eq("seller_id", sellerId)

    if (error) throw new Error(`Failed to archive product: ${error.message}`)

    revalidatePath("/seller/products")
    revalidatePath("/products")
    
    return { success: true }
  } catch (error: any) {
    console.error("Error archiving product:", error)
    return { success: false, error: error.message || "An error occurred" }
  }
}
