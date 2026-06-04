"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { updateSellerStatus } from "@/services/admin/actions"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"

interface PendingSeller {
  id: string;
  store_name: string;
  business_type: string | null;
  created_at: string;
}

export function SellerApprovalCard({ sellers }: { sellers: PendingSeller[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleAction(id: string, status: "approved" | "rejected") {
    try {
      setProcessingId(id);
      await updateSellerStatus(id, status);
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Sellers waiting for account verification.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sellers.map((approval) => (
          <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div className="flex flex-col">
              <span className="font-medium">{approval.store_name}</span>
              <span className="text-xs text-muted-foreground">
                {approval.business_type || "Unspecified"} • {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => handleAction(approval.id, "approved")}
                disabled={processingId !== null}
              >
                {processingId === approval.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleAction(approval.id, "rejected")}
                disabled={processingId !== null}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {sellers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No pending approvals.</p>
        )}
      </CardContent>
    </Card>
  )
}
