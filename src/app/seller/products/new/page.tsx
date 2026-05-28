import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ProductForm } from "@/components/seller/product-form"
import { fetchCategories } from "@/services/categories"

export default async function NewProductPage() {
  const categories = await fetchCategories()

  return (
    <DashboardShell>
      <div className="mx-auto w-full">
        <ProductForm categories={categories} />
      </div>
    </DashboardShell>
  )
}
