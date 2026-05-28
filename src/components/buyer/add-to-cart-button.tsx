"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"

interface AddToCartButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
    sellerName: string
    maxQuantity?: number
  }
  quantity?: number
  showText?: boolean
}

export function AddToCartButton({ 
  product, 
  quantity = 1, 
  showText = true, 
  className,
  variant = "secondary",
  ...props 
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isAdded, setIsAdded] = React.useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a Link
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      sellerName: product.sellerName,
      quantity,
      maxQuantity: product.maxQuantity || 99,
    })
    
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <Button 
      className={className} 
      variant={isAdded ? "default" : variant}
      onClick={handleAddToCart}
      {...props}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {showText ? (isAdded ? "Added!" : "Add to Cart") : null}
    </Button>
  )
}
