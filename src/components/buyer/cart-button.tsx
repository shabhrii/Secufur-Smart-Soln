"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { Badge } from "@/components/ui/badge"

interface CartButtonProps {
  itemCount?: number
}

export function CartButton({ itemCount = 0 }: CartButtonProps) {
  return (
    <Link href={ROUTES.BUYER.CART} className="relative p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center">
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Link>
  )
}
