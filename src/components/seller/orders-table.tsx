import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MOCK_ORDERS = [
  { id: "ORD-001", customer: "John Doe", date: "2026-05-28", total: "$120.00", status: "pending" },
  { id: "ORD-002", customer: "Sarah Smith", date: "2026-05-27", total: "$45.50", status: "shipped" },
  { id: "ORD-003", customer: "Michael Brown", date: "2026-05-27", total: "$89.99", status: "delivered" },
  { id: "ORD-004", customer: "Emily Davis", date: "2026-05-26", total: "$210.00", status: "cancelled" },
]

export function OrdersTable() {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending": return <Badge variant="outline" className="text-amber-500 border-amber-500/50">Pending</Badge>
      case "shipped": return <Badge variant="outline" className="text-blue-500 border-blue-500/50">Shipped</Badge>
      case "delivered": return <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">Delivered</Badge>
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ORDERS.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell className="text-right">{getStatusBadge(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
