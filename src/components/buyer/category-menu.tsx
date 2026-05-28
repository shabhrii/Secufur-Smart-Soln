import Link from "next/link"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Electronics", "Clothing", "Home & Garden", "Sports", 
  "Beauty", "Automotive", "Toys", "Health", "Books", "Jewelry"
]

export function CategoryMenu({ className }: { className?: string }) {
  return (
    <div className={cn("w-full bg-background border-b shadow-sm overflow-x-auto no-scrollbar", className)}>
      <div className="container mx-auto px-4 flex items-center h-12 gap-6 min-w-max">
        <span className="text-sm font-semibold whitespace-nowrap">All Categories:</span>
        {CATEGORIES.map((category) => (
          <Link 
            key={category} 
            href="#" 
            className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 whitespace-nowrap transition-colors"
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  )
}
