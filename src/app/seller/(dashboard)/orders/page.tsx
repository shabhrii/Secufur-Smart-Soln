import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SectionHeader } from "@/components/shared/section-header"
import { OrdersTable } from "@/components/seller/orders-table"
import { fetchSellerOrders } from "@/services/orders"
import { type OrderStatus } from "@/types/database"

export default async function SellerOrdersPage() {
  const sellerOrderItems = await fetchSellerOrders()

  // Group order items by order ID to create order-level rows
  const orderMap = new Map<string, {
    orderId: string
    customerName: string
    date: string
    items: string[]
    total: number
    status: OrderStatus
  }>()

  for (const item of sellerOrderItems) {
    const orderId = item.orders?.id
    if (!orderId) continue

    if (!orderMap.has(orderId)) {
      orderMap.set(orderId, {
        orderId,
        customerName: item.orders?.profiles?.full_name || "Unknown Customer",
        date: item.orders?.created_at || "",
        items: [],
        total: 0,
        status: item.orders?.order_status || "pending",
      })
    }

    const orderRow = orderMap.get(orderId)!
    orderRow.items.push(`${item.products?.name || "Product"} ×${item.quantity}`)
    orderRow.total += item.total_price
  }

  const orders = Array.from(orderMap.values()).map(o => ({
    orderId: o.orderId,
    customerName: o.customerName,
    date: o.date,
    itemsSummary: o.items.join(", "),
    total: o.total,
    status: o.status,
  }))

  return (
    <DashboardShell>
      <SectionHeader
        title="Order Management"
        description="View and manage orders containing your products."
      />

      <OrdersTable orders={orders} title="All Orders" />
    </DashboardShell>
  )
}
