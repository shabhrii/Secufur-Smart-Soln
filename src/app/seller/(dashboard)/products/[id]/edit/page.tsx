import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ProductForm } from "@/components/seller/product-form"
import { fetchCategories } from "@/services/categories"
import { fetchSellerProductById } from "@/services/seller-products"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [categories, product] = await Promise.all([
    fetchCategories(),
    fetchSellerProductById(id)
  ])

  if (!product) {
    notFound()
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category_id: product.category_id || "",
    short_description: product.short_description || "",
    description: product.description || "",
    price: product.price,
    compare_at_price: product.compare_at_price,
    stock_quantity: product.stock_quantity,
    sku: product.sku || "",
    status: product.status,
    featured: product.featured,
    images: product.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map(img => img.image_url) || []
  }

  return (
    <DashboardShell>
      <div className="mx-auto w-full">
        <ProductForm categories={categories} initialData={initialData} />
      </div>
    </DashboardShell>
  )
}
