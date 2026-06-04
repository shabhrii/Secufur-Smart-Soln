import { fetchSellerOrderDetail } from "@/services/orders"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SectionHeader } from "@/components/shared/section-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { OrderStatusActions } from "@/components/seller/order-status-actions"
import { Package, MapPin, ArrowLeft, User } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
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

export default async function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await fetchSellerOrderDetail(id)

  if (!order) {
    notFound()
  }


  return (
    <DashboardShell>
      {/* Back link */}
      <Link
        href="/seller/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
          description={`Placed on ${formatDate(order.created_at)}`}
        />
        <div className="flex items-center gap-2">
          {getOrderStatusBadge(order.order_status)}
          {getPaymentStatusBadge(order.payment_status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Items + Actions */}
        <div className="lg:col-span-8 space-y-6">

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fulfillment</CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_status === "delivered" ? (
                <p className="text-sm text-emerald-600 font-medium">This order has been delivered.</p>
              ) : order.order_status === "cancelled" ? (
                <p className="text-sm text-destructive font-medium">This order has been cancelled. Inventory has been restored.</p>
              ) : (
                <OrderStatusActions orderId={order.id} currentStatus={order.order_status} />
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items ({order.order_items.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.order_items.map((item) => {
                  const imgUrl = item.products?.product_images?.find(img => img.is_primary)?.image_url
                    || item.products?.product_images?.[0]?.image_url

                  return (
                    <div key={item.id} className="p-5 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
                        {imgUrl ? (
                          <div
                            className="w-full h-full"
                            style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.products?.name || "Product"}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold text-right">{formatCurrency(item.total_price)}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer + Address + Summary */}
        <div className="lg:col-span-4 space-y-6">

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">{order.buyer_name || "Unknown Customer"}</p>
              {order.buyer_email && (
                <p className="text-muted-foreground">{order.buyer_email}</p>
              )}
              <p className="text-muted-foreground">{order.buyer_phone || "No phone provided"}</p>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address_json && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.shipping_address_json.full_name}</p>
                <p className="text-muted-foreground">{order.shipping_address_json.address_line_1}</p>
                {order.shipping_address_json.address_line_2 && (
                  <p className="text-muted-foreground">{order.shipping_address_json.address_line_2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.shipping_address_json.city}, {order.shipping_address_json.state} {order.shipping_address_json.postal_code}
                </p>
                <p className="text-muted-foreground">{order.shipping_address_json.country}</p>
                {order.shipping_address_json.phone && (
                  <p className="text-muted-foreground mt-2">{order.shipping_address_json.phone}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
