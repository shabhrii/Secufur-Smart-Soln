import { PageContainer } from "@/components/shared/page-container";
import { CategoryMenu } from "@/components/buyer/category-menu";
import { HeroBanner } from "@/components/buyer/hero-banner";
import { ProductGrid } from "@/components/buyer/product-grid";
import { ProductCard } from "@/components/buyer/product-card";
import { SectionHeader } from "@/components/shared/section-header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <CategoryMenu />
      
      <PageContainer className="pt-6 pb-12 space-y-12">
        <HeroBanner />
        
        <section>
          <SectionHeader 
            title="Featured Products" 
            description="Handpicked deals from top-rated sellers." 
          />
          <ProductGrid>
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCard
                key={i}
                id={`prod-${i}`}
                name={`Premium Wireless Headphones Series ${i + 1}`}
                price={199.99 - i * 10}
                compareAtPrice={249.99}
                rating={4.8}
                reviewsCount={128 + i * 5}
                imageUrl={`https://picsum.photos/seed/${i + 10}/400/400`}
                sellerName="TechGadget Store"
                isFeatured={i < 2}
              />
            ))}
          </ProductGrid>
        </section>
      </PageContainer>
    </div>
  );
}
