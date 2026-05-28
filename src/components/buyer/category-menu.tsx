import Link from "next/link"
import { cn } from "@/lib/utils"
import { type Category } from "@/types/database"

export function CategoryMenu({ 
  categories,
  className 
}: { 
  categories: Category[]
  className?: string 
}) {
  return (
    <div className={cn("w-full bg-background border-b shadow-sm overflow-x-auto no-scrollbar", className)}>
      <div className="container mx-auto px-4 flex items-center h-12 gap-6 min-w-max">
        <span className="text-sm font-semibold whitespace-nowrap">All Categories:</span>
        <Link 
          href="/products" 
          className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 whitespace-nowrap transition-colors"
        >
          View All
        </Link>
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/products?category=${category.slug}`} 
            className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 whitespace-nowrap transition-colors"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
