import { PageContainer } from "@/components/shared/page-container";
import { CategoryMenu } from "@/components/buyer/category-menu";
import { HeroBanner } from "@/components/buyer/hero-banner";
import { ProductGrid } from "@/components/buyer/product-grid";
import { ProductCard } from "@/components/buyer/product-card";
import { SectionHeader } from "@/components/shared/section-header";
import { fetchCategories } from "@/services/categories";
import { fetchFeaturedProducts } from "@/services/products";

export default async function Home() {
  const categories = await fetchCategories();
  const featuredProducts = await fetchFeaturedProducts(10);

  return (
    <div className="flex flex-col min-h-screen">
      <CategoryMenu categories={categories} />
      
      <PageContainer className="pt-6 pb-12 space-y-12">
        <HeroBanner />
        
        <section>
          <SectionHeader 
            title="Featured Products" 
            description="Handpicked deals from top-rated sellers." 
          />
          {featuredProducts.length > 0 ? (
            <ProductGrid>
              {featuredProducts.map((product) => {
                const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
                  || product.product_images?.[0]?.image_url 
                  || "https://picsum.photos/400/400"; // Fallback placeholder
                  
                return (
                  <ProductCard
                    key={product.id}
                    id={product.slug} 
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
            <div className="p-8 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/20">
              No featured products found. Check back later!
            </div>
          )}
        </section>
      </PageContainer>
    </div>
  );
}
