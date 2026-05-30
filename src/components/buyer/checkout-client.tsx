"use client"

import * as React from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CreditCard, ShoppingCart as CartIcon, Truck, CheckCircle2, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

interface Address {
  id: string
  full_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

interface CheckoutClientProps {
  initialAddresses: Address[]
}

export function CheckoutClient({ initialAddresses }: CheckoutClientProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const cartStore = useCartStore()
  
  // Basic state for the foundation layout
  const [selectedAddress, setSelectedAddress] = React.useState<string | null>(
    initialAddresses.length > 0 ? initialAddresses[0].id : null
  )

  React.useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="animate-pulse min-h-[60vh] flex flex-col items-center justify-center">
        <div className="h-8 w-32 bg-muted rounded mb-4" />
      </div>
    )
  }

  const { items, getSubtotal } = cartStore
  const subtotal = getSubtotal()
  const shipping = items.length > 0 ? 15.00 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <CartIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Checkout Unavailable</h2>
        <p className="text-muted-foreground mb-8">Your cart is empty. Add some items before proceeding to checkout.</p>
        <Link href={ROUTES.HOME}>
          <Button>Return to Shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Checkout Steps */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Step 1: Shipping Address */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 pb-4">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
            <CardTitle className="text-xl">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {initialAddresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {initialAddresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className={`border rounded-lg p-4 cursor-pointer relative transition-all ${
                      selectedAddress === addr.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedAddress(addr.id)}
                  >
                    {selectedAddress === addr.id && (
                      <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
                    )}
                    <p className="font-semibold">{addr.full_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{addr.address_line_1}</p>
                    {addr.address_line_2 && <p className="text-sm text-muted-foreground">{addr.address_line_2}</p>}
                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                    <p className="text-sm text-muted-foreground">{addr.country}</p>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {addr.phone || "No phone provided"}
                    </p>
                  </div>
                ))}
                
                {/* Add New Address Placeholder Box */}
                <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors min-h-[140px]">
                  <Plus className="h-8 w-8 mb-2" />
                  <span className="font-medium">Add New Address</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium text-lg mb-1">No addresses found</h3>
                <p className="text-sm text-muted-foreground mb-4">Please add a shipping address to continue.</p>
                <Button variant="outline">Add Address</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Shipping Method (Static Foundation) */}
        <Card className="opacity-80">
          <CardHeader className="flex flex-row items-center gap-4 bg-muted/10 pb-4">
            <div className="bg-muted text-muted-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
            <CardTitle className="text-xl text-muted-foreground">Shipping Method</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg p-4 flex items-center justify-between border-primary bg-primary/5">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Standard Delivery</p>
                  <p className="text-sm text-muted-foreground">3-5 business days</p>
                </div>
              </div>
              <p className="font-semibold">$15.00</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Payment (Static Placeholder) */}
        <Card className="opacity-80">
          <CardHeader className="flex flex-row items-center gap-4 bg-muted/10 pb-4">
            <div className="bg-muted text-muted-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
            <CardTitle className="text-xl text-muted-foreground">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center py-10">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Secure Payment Integration</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              The Razorpay payment gateway will be mounted here in the next phase of development.
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          
          {/* Items Preview */}
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden border">
                  {item.imageUrl ? (
                    <div 
                      className="w-full h-full object-cover"
                      style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <h4 className="font-medium line-clamp-2">{item.name}</h4>
                  <p className="text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />

          {/* Calculations */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Fake Submit */}
          <Button 
            size="lg" 
            className="w-full mt-6 h-12 text-base" 
            disabled={!selectedAddress}
          >
            Continue to Payment
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            By placing your order, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
