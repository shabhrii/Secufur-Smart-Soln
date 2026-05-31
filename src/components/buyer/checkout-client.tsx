"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ShoppingCart as CartIcon, Truck, CheckCircle2, Plus, Loader2, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { createOrder } from "@/services/orders/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddressForm } from "./address-form"

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

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="animate-pulse min-h-[60vh] flex flex-col items-center justify-center">
        <div className="h-8 w-32 bg-muted rounded mb-4" />
      </div>
    )
  }

  return <CheckoutContent initialAddresses={initialAddresses} />
}

function CheckoutContent({ initialAddresses }: CheckoutClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [orderError, setOrderError] = React.useState<string | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false)
  const cartStore = useCartStore()
  
  const [selectedAddress, setSelectedAddress] = React.useState<string | null>(
    initialAddresses.length > 0 ? initialAddresses[0].id : null
  )

  const prevAddressesRef = React.useRef(initialAddresses.length)
  React.useEffect(() => {
    if (initialAddresses.length > prevAddressesRef.current) {
      setSelectedAddress(initialAddresses[0].id)
    } else if (initialAddresses.length > 0 && !selectedAddress) {
      setSelectedAddress(initialAddresses[0].id)
    }
    prevAddressesRef.current = initialAddresses.length
  }, [initialAddresses, selectedAddress])

  const { items, getSubtotal, clearCart } = cartStore
  const subtotal = getSubtotal()
  const shipping = items.length > 0 ? 15.00 : 0
  const total = subtotal + shipping

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

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setOrderError("Please select a shipping address.")
      return
    }

    setIsSubmitting(true)
    setOrderError(null)

    try {
      const result = await createOrder({
        addressId: selectedAddress,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      })

      if (result.success && result.orderId) {
        clearCart()
        router.push(`/orders/${result.orderId}/success`)
      } else {
        if (result.stockErrors && result.stockErrors.length > 0) {
          const stockMessages = result.stockErrors.map(
            e => `"${e.productName}" — only ${e.available} available (you requested ${e.requested})`
          )
          setOrderError(`Stock issue:\n${stockMessages.join("\n")}`)
        } else {
          setOrderError(result.error || "Failed to place order. Please try again.")
        }
      }
    } catch {
      setOrderError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddressSuccess = () => {
    setIsAddressModalOpen(false)
    router.refresh()
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
                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                  <DialogTrigger 
                    render={
                      <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors min-h-[140px]" />
                    }
                  >
                    <Plus className="h-8 w-8 mb-2" />
                    <span className="font-medium">Add New Address</span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <AddressForm 
                      onSuccess={handleAddressSuccess} 
                      onCancel={() => setIsAddressModalOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium text-lg mb-1">No addresses found</h3>
                <p className="text-sm text-muted-foreground mb-4">Please add a shipping address to continue.</p>
                
                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                  <DialogTrigger render={<Button variant="outline" />}>
                    Add Address
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <AddressForm 
                      onSuccess={handleAddressSuccess} 
                      onCancel={() => setIsAddressModalOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Shipping Method */}
        <Card className={selectedAddress ? "" : "opacity-60"}>
          <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 pb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${selectedAddress ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
            <CardTitle className={`text-xl ${selectedAddress ? "" : "text-muted-foreground"}`}>Shipping Method</CardTitle>
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
            
            <Separator className="my-4" />
            
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Error message */}
          {orderError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive whitespace-pre-line">{orderError}</p>
            </div>
          )}
          
          {/* Place Order */}
          <Button 
            size="lg" 
            className="w-full mt-6 h-12 text-base" 
            disabled={!selectedAddress || isSubmitting}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            By placing your order, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
