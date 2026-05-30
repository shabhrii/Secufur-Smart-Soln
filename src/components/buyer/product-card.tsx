import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "./add-to-cart-button"

export interface ProductCardProps {
  id: string
  slug?: string
  name: string
  price: number
  compareAtPrice?: number
  rating: number
  reviewsCount: number
  imageUrl: string
  sellerName: string
  isFeatured?: boolean
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  compareAtPrice,
  rating,
  reviewsCount,
  imageUrl,
  sellerName,
  isFeatured
}: ProductCardProps) {
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <Card className="overflow-hidden flex flex-col h-full group hover:shadow-lg transition-all duration-300 border-border/50">
      <Link href={`/product/${slug || id}`} className="relative block aspect-square bg-muted overflow-hidden">
        {isFeatured && (
          <Badge className="absolute top-2 left-2 z-10 bg-primary/90 backdrop-blur-sm">Featured</Badge>
        )}
        {discount > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 z-10">{discount}% OFF</Badge>
        )}
        {/* Placeholder for real Image component */}
        <div 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-slate-200 dark:bg-slate-800"
          style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      </Link>
      
      <CardContent className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <span className="font-medium text-primary/80">{sellerName}</span>
        </div>
        
        <Link href={`/product/${slug || id}`} className="block group-hover:text-primary transition-colors">
          <h3 className="font-semibold text-base line-clamp-2 leading-tight">{name}</h3>
        </Link>
        
        <div className="flex items-center gap-1 mt-auto pt-2">
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviewsCount})</span>
        </div>
        
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
          {compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">${compareAtPrice.toFixed(2)}</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <AddToCartButton 
          className="w-full rounded-md shadow-sm"
          product={{
            id,
            name,
            price,
            imageUrl,
            sellerName
          }}
        />
      </CardFooter>
    </Card>
  )
}
