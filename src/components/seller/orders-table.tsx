import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { type OrderStatus } from "@/types/database"

interface OrderRow {
  orderId: string
  customerName: string
  date: string
  itemsSummary: string
  total: number
  status: OrderStatus
}

interface OrdersTableProps {
  orders: OrderRow[]
  title?: string
}

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

export function OrdersTable({ orders, title = "Recent Orders" }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="h-7 w-7 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-1">Orders for your products will appear here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell className="font-mono font-medium text-sm">
                  #{order.orderId.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                  {order.itemsSummary}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(order.date)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                <TableCell className="text-right">{getStatusBadge(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
