import { fetchBuyerOrders } from "@/services/orders"
import { PageContainer } from "@/components/shared/page-container"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { type OrderStatus } from "@/types/database"

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-amber-500 border-amber-500/50">Pending</Badge>
    case "confirmed":
      return <Badge variant="outline" className="text-blue-500 border-blue-500/50">Confirmed</Badge>
    case "shipped":
      return <Badge variant="outline" className="text-violet-500 border-violet-500/50">Shipped</Badge>
    case "delivered":
      return <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">Delivered</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default async function BuyerOrdersPage() {
  const orders = await fetchBuyerOrders()

  return (
    <PageContainer className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage your purchases</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed rounded-xl bg-muted/20">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            When you place an order, it will appear here. Start exploring products from our marketplace.
          </p>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-6 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0)
            const firstItemImage = order.order_items[0]?.products?.product_images?.find(img => img.is_primary)?.image_url
              || order.order_items[0]?.products?.product_images?.[0]?.image_url

            return (
              <Link
                key={order.id}
                href={ROUTES.BUYER.ORDER_DETAIL(order.id)}
                className="block rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Order info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
                        {firstItemImage ? (
                          <div
                            className="w-full h-full"
                            style={{ backgroundImage: `url(${firstItemImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                          {getStatusBadge(order.order_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)} · {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {order.order_items.map(item => item.products?.name).filter(Boolean).slice(0, 2).join(", ")}
                          {order.order_items.length > 2 && ` +${order.order_items.length - 2} more`}
                        </p>
                      </div>
                    </div>

                    {/* Right: Total */}
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-lg font-bold">{formatCurrency(order.total_amount)}</p>
                        <p className="text-xs text-muted-foreground">incl. shipping</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
