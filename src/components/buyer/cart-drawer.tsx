"use client"

import * as React from "react"
import { useCartStore } from "@/store/cart-store"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function CartDrawer() {
  const [isMounted, setIsMounted] = React.useState(false)
  const cartStore = useCartStore()

  // Prevent hydration errors with Zustand persist
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="relative rounded-full">
        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
      </Button>
    )
  }

  const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = cartStore
  const totalItems = getTotalItems()
  const subtotal = getSubtotal()

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="relative rounded-full" />}>
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full">
              {totalItems}
            </Badge>
          )}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left">Your Cart ({totalItems})</SheetTitle>
        </SheetHeader>
        
        <Separator className="mt-4" />

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div>
                <p className="font-medium text-lg">Your cart is empty</p>
                <p className="text-muted-foreground text-sm mt-1">Looks like you haven't added anything yet.</p>
              </div>
              <SheetClose render={<Button className="mt-4" />}>
                Continue Shopping
              </SheetClose>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden border">
                  {item.imageUrl ? (
                    <div 
                      className="w-full h-full object-cover"
                      style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.sellerName}</p>
                    </div>
                    <p className="font-semibold text-sm ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md h-7">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full w-7 rounded-none"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-medium w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full w-7 rounded-none"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between font-medium">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart">
                <SheetClose render={<Button variant="outline" className="w-full" />}>
                  View Cart
                </SheetClose>
              </Link>
              <Link href="/checkout">
                <SheetClose render={<Button className="w-full" />}>
                  Checkout
                </SheetClose>
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
