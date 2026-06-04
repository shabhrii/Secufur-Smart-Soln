import { fetchProductBySlug, fetchFeaturedProducts } from "@/services/products"
import { notFound } from "next/navigation"
import { PageContainer } from "@/components/shared/page-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, ShieldCheck, Store } from "lucide-react"
import { ProductGrid } from "@/components/buyer/product-grid"
import { ProductCard } from "@/components/buyer/product-card"
import { AddToCartButton } from "@/components/buyer/add-to-cart-button"

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Fetch some related products (using featured for now as a fallback placeholder)
  const relatedProducts = await fetchFeaturedProducts(4)

  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url 
    || "https://picsum.photos/600/600"

  const discount = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) 
    : 0;

  return (
    <PageContainer className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
            <div 
              className="w-full h-full object-cover"
              style={{ backgroundImage: `url(${primaryImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          </div>
          {/* Thumbnails placeholder */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.product_images.map((img) => (
                <div key={img.id} className="w-20 h-20 shrink-0 bg-muted rounded-md border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary">
                   <div 
                    className="w-full h-full object-cover"
                    style={{ backgroundImage: `url(${img.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {product.categories && (
            <div className="mb-3 text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {product.categories.name}
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-amber-500">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current opacity-50" />
              <span className="ml-2 text-sm font-medium text-foreground text-foreground">4.8 (124 reviews)</span>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.compare_at_price && (
              <>
                <span className="text-xl text-muted-foreground line-through mb-1">${product.compare_at_price.toFixed(2)}</span>
                <Badge variant="destructive" className="mb-2">{discount}% OFF</Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {product.short_description || product.description || "No description provided."}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Sold by {product.sellers?.store_name}</div>
                  <div className="text-sm text-muted-foreground">Verified Marketplace Seller</div>
                </div>
              </div>
              <Button variant="outline" size="sm">View Store</Button>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span>Secufur Buyer Protection enabled for this purchase</span>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="text-sm font-medium">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600">In Stock ({product.stock_quantity} available)</span>
              ) : (
                <span className="text-destructive">Out of Stock</span>
              )}
            </div>
            <AddToCartButton 
              size="lg" 
              className="w-full h-14 text-lg" 
              disabled={product.stock_quantity <= 0}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: primaryImage,
                sellerName: product.sellers?.store_name || "Unknown Seller",
                maxQuantity: product.stock_quantity
              }}
            />
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Product Details Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Product Details</h2>
        <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
          <p>{product.description}</p>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Related Products */}
      <section>
        <h2 className="text-2xl font-bold mb-8">You may also like</h2>
        <ProductGrid>
          {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map((rel) => {
            const relPrimaryImage = rel.product_images?.find(img => img.is_primary)?.image_url 
              || rel.product_images?.[0]?.image_url 
              || "https://picsum.photos/400/400";
              
            return (
              <ProductCard
                key={rel.id}
                id={rel.id}
                slug={rel.slug}
                name={rel.name}
                price={rel.price}
                compareAtPrice={rel.compare_at_price || undefined}
                rating={5.0}
                reviewsCount={0}
                imageUrl={relPrimaryImage}
                sellerName={rel.sellers?.store_name || "Unknown"}
                isFeatured={rel.featured}
              />
            );
          })}
        </ProductGrid>
      </section>
    </PageContainer>
  )
}
