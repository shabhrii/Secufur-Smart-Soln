import { PageContainer } from "@/components/shared/page-container"
import { SectionHeader } from "@/components/shared/section-header"
import { ProductGrid } from "@/components/buyer/product-grid"
import { ProductCard } from "@/components/buyer/product-card"
import { fetchAllProducts } from "@/services/products"
import { fetchCategories } from "@/services/categories"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const categorySlug = typeof searchParams.category === 'string' ? searchParams.category : null;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : null;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : "newest";

  let sortBy = "created_at";
  let sortOrder: "asc" | "desc" = "desc";

  if (sort === "price_asc") {
    sortBy = "price";
    sortOrder = "asc";
  } else if (sort === "price_desc") {
    sortBy = "price";
    sortOrder = "desc";
  }

  const [{ products, count }, categories] = await Promise.all([
    fetchAllProducts({
      limit: 20,
      offset: 0,
      categorySlug,
      searchQuery,
      sortBy,
      sortOrder,
    }),
    fetchCategories(),
  ]);

  let title = "All Products";
  if (searchQuery) {
    title = `Search Results for "${searchQuery}"`;
  } else if (categorySlug) {
    const matchedCategory = categories.find(c => c.slug === categorySlug);
    if (matchedCategory) {
      title = matchedCategory.name;
    }
  }

  return (
    <PageContainer className="flex flex-col md:flex-row gap-8 py-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <h3 className="font-semibold mb-4 text-lg">Categories</h3>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/products"
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  !categorySlug ? "font-semibold text-primary" : "text-muted-foreground"
                )}
              >
                All Categories
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link 
                  href={`/products?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`}
                  className={cn(
                    "text-sm hover:text-primary transition-colors",
                    categorySlug === cat.slug ? "font-semibold text-primary" : "text-muted-foreground"
                  )}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-lg">Sort By</h3>
          <ul className="space-y-2">
            <li>
              <Link 
                href={`?sort=newest${categorySlug ? `&category=${categorySlug}` : ''}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  sort === "newest" ? "font-semibold text-primary" : "text-muted-foreground"
                )}
              >
                Newest Arrivals
              </Link>
            </li>
            <li>
              <Link 
                href={`?sort=price_asc${categorySlug ? `&category=${categorySlug}` : ''}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  sort === "price_asc" ? "font-semibold text-primary" : "text-muted-foreground"
                )}
              >
                Price: Low to High
              </Link>
            </li>
            <li>
              <Link 
                href={`?sort=price_desc${categorySlug ? `&category=${categorySlug}` : ''}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  sort === "price_desc" ? "font-semibold text-primary" : "text-muted-foreground"
                )}
              >
                Price: High to Low
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <SectionHeader 
          title={title} 
          description={`Showing ${products.length} of ${count} products.`} 
          className="mb-6"
        />

        {products.length > 0 ? (
          <ProductGrid>
            {products.map((product) => {
              const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
                || product.product_images?.[0]?.image_url 
                || "https://picsum.photos/400/400"; // Fallback placeholder
                
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  compareAtPrice={product.compare_at_price || undefined}
                  rating={5.0} 
                  reviewsCount={0}
                  imageUrl={primaryImage}
                  sellerName={product.sellers?.store_name || "Unknown Seller"}
                  isFeatured={product.featured}
                />
              );
            })}
          </ProductGrid>
        ) : (
          <div className="p-12 border border-dashed rounded-lg flex flex-col items-center justify-center text-center bg-muted/10 space-y-3">
            <h3 className="text-xl font-semibold">No products found</h3>
            <p className="text-muted-foreground max-w-sm">
              We couldn&apos;t find any products matching your current filters. Try adjusting your search or category selection.
            </p>
            <Link 
              href="/products" 
              className="mt-4 text-primary font-medium hover:underline"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </main>
    </PageContainer>
  )
}
