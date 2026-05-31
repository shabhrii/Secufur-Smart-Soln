import { fetchOrderDetail } from "@/services/orders"
import { PageContainer } from "@/components/shared/page-container"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, ArrowLeft, Truck } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { notFound } from "next/navigation"
import { type OrderStatus, type PaymentStatus } from "@/types/database"

function getOrderStatusBadge(status: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    pending: "text-amber-500 border-amber-500/50",
    confirmed: "text-blue-500 border-blue-500/50",
    shipped: "text-violet-500 border-violet-500/50",
    delivered: "text-emerald-500 border-emerald-500/50",
    cancelled: "",
  }

  if (status === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>
  }

  return (
    <Badge variant="outline" className={styles[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function getPaymentStatusBadge(status: PaymentStatus) {
  const styles: Record<PaymentStatus, string> = {
    pending: "text-amber-500 border-amber-500/50",
    paid: "text-emerald-500 border-emerald-500/50",
    failed: "text-red-500 border-red-500/50",
    refunded: "text-violet-500 border-violet-500/50",
  }

  return (
    <Badge variant="outline" className={styles[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

// Order timeline steps
const ORDER_STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"]

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await fetchOrderDetail(id)

  if (!order) {
    notFound()
  }

  const currentStepIndex = ORDER_STEPS.indexOf(order.order_status)
  const isCancelled = order.order_status === "cancelled"

  return (
    <PageContainer className="py-8">
      {/* Back link */}
      <Link
        href={ROUTES.BUYER.ORDERS}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          {getOrderStatusBadge(order.order_status)}
          {getPaymentStatusBadge(order.payment_status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items + Timeline */}
        <div className="lg:col-span-8 space-y-6">

          {/* Status Timeline */}
          {!isCancelled && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted mx-8" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-primary mx-8 transition-all"
                  style={{ width: `${Math.max(0, currentStepIndex) / (ORDER_STEPS.length - 1) * 100}%` }}
                />

                {ORDER_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step} className="relative flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                            : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        {index + 1}
                      </div>
                      <span className={`text-xs mt-2 font-medium capitalize ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-destructive font-medium">This order has been cancelled.</p>
            </div>
          )}

          {/* Order Items */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-5 border-b bg-muted/30">
              <h2 className="text-lg font-semibold">Items ({order.order_items.length})</h2>
            </div>
            <div className="divide-y">
              {order.order_items.map((item) => {
                const imgUrl = item.products?.product_images?.find(img => img.is_primary)?.image_url
                  || item.products?.product_images?.[0]?.image_url

                return (
                  <div key={item.id} className="p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
                      {imgUrl ? (
                        <div
                          className="w-full h-full"
                          style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.products?.name || "Product"}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Sold by {item.sellers?.store_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold text-right">{formatCurrency(item.total_price)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Summary + Address */}
        <div className="lg:col-span-4 space-y-6">

          {/* Price Breakdown */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Shipping
                </span>
                <span className="font-medium">{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.addresses && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Shipping Address
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.addresses.full_name}</p>
                <p className="text-muted-foreground">{order.addresses.address_line_1}</p>
                {order.addresses.address_line_2 && (
                  <p className="text-muted-foreground">{order.addresses.address_line_2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}
                </p>
                <p className="text-muted-foreground">{order.addresses.country}</p>
                {order.addresses.phone && (
                  <p className="text-muted-foreground mt-2">{order.addresses.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
