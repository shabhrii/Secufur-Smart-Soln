import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

const MOCK_FLAGS = [
  { id: "FLG-001", type: "Review", reportedBy: "user_123", reason: "Inappropriate language", status: "pending" },
  { id: "FLG-002", type: "Product", reportedBy: "user_456", reason: "Counterfeit item", status: "pending" },
  { id: "FLG-003", type: "Seller", reportedBy: "user_789", reason: "Scam suspected", status: "resolved" },
]

export function ModerationTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Content Moderation</CardTitle>
        <Button variant="outline" size="sm">
          <ShieldAlert className="w-4 h-4 mr-2" />
          View All Flags
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_FLAGS.map((flag) => (
              <TableRow key={flag.id}>
                <TableCell className="font-medium">{flag.id}</TableCell>
                <TableCell>{flag.type}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[200px]">{flag.reason}</TableCell>
                <TableCell>
                  {flag.status === "pending" ? (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/50">Needs Review</Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">Resolved</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
