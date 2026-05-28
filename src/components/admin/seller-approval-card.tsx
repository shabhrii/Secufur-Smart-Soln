import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

const MOCK_APPROVALS = [
  { id: "SEL-001", name: "Tech Gadgets Pro", businessType: "Electronics", date: "2 Hours ago" },
  { id: "SEL-002", name: "Fashion Boutique", businessType: "Clothing", date: "5 Hours ago" },
]

export function SellerApprovalCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Sellers waiting for account verification.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_APPROVALS.map((approval) => (
          <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div className="flex flex-col">
              <span className="font-medium">{approval.name}</span>
              <span className="text-xs text-muted-foreground">{approval.businessType} • {approval.date}</span>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {MOCK_APPROVALS.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No pending approvals.</p>
        )}
      </CardContent>
    </Card>
  )
}
