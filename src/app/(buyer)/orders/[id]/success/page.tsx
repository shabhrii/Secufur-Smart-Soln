import { fetchOrderDetail } from "@/services/orders"
import { PageContainer } from "@/components/shared/page-container"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { CheckCircle2, Package, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { notFound } from "next/navigation"

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await fetchOrderDetail(id)

  if (!order) {
    notFound()
  }

  return (
    <PageContainer className="py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your order. We&apos;ll send you updates as your order progresses.
        </p>

        {/* Order Summary Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 text-left mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            {order.order_items.map((item) => {
              const imgUrl = item.products?.product_images?.find(img => img.is_primary)?.image_url
                || item.products?.product_images?.[0]?.image_url

              return (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden border">
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
                    <p className="text-sm font-medium truncate">{item.products?.name || "Product"}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.total_price)}</p>
                </div>
              )
            })}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={ROUTES.BUYER.ORDER_DETAIL(order.id)}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-6 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View Order Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background h-11 px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
