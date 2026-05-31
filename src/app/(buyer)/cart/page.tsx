"use client"

import * as React from "react"
import { useCartStore } from "@/store/cart-store"
import { PageContainer } from "@/components/shared/page-container"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

export default function CartPage() {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <PageContainer className="py-8 min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full mb-4" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </PageContainer>
    )
  }

  return <CartContent />
}

function CartContent() {
  const cartStore = useCartStore()
  const { items, updateQuantity, removeItem, getSubtotal } = cartStore
  const subtotal = getSubtotal()

  if (items.length === 0) {
    return (
      <PageContainer className="py-16 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Looks like you haven&apos;t added anything to your cart yet. Discover great products from our marketplace sellers.
        </p>
        <Link href={ROUTES.HOME}>
          <Button size="lg">Start Shopping</Button>
        </Link>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b bg-muted/40">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
                  {/* Product Details */}
                  <div className="md:col-span-6 flex gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-muted flex-shrink-0 overflow-hidden border">
                      {item.imageUrl ? (
                        <div 
                          className="w-full h-full object-cover"
                          style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200" />
                      )}
                    </div>
                    <div className="flex flex-col py-1">
                      <Link href={`/product/${item.id}`} className="font-semibold text-base sm:text-lg hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">Sold by {item.sellerName}</p>
                      <p className="font-medium text-sm mt-auto md:hidden">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Controls (Mobile: flex row, Desktop: grid cols) */}
                  <div className="md:col-span-6 flex items-center justify-between md:grid md:grid-cols-6 gap-4">
                    
                    {/* Quantity */}
                    <div className="md:col-span-3 flex items-center justify-center">
                      <div className="flex items-center border rounded-md h-9">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-full w-9 rounded-none"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-10 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-full w-9 rounded-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Total & Remove */}
                    <div className="md:col-span-3 flex items-center justify-end gap-4 md:gap-6">
                      <span className="font-bold text-base sm:text-lg hidden md:block">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping estimate</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax estimate</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between text-base font-bold">
                <span>Estimated Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <Link href="/checkout">
              <Button size="lg" className="w-full mt-6 h-12 text-base">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <div className="mt-4 text-center">
              <Link href={ROUTES.HOME} className="text-sm text-primary hover:underline font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
