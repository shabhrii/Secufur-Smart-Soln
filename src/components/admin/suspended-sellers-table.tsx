"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Undo2, Loader2 } from "lucide-react";
import { restoreSeller } from "@/services/admin/actions";

interface SuspendedSeller {
  id: string;
  store_name: string;
  business_type: string | null;
  status: string;
  rejection_reason: string | null;
  updated_at: string;
  profiles: { full_name: string | null } | null;
}

export function SuspendedSellersTable({ sellers }: { sellers: SuspendedSeller[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleRestore(id: string) {
    if (!window.confirm("Are you sure you want to restore this seller? They will immediately regain marketplace access.")) return;
    
    try {
      setProcessingId(id);
      await restoreSeller(id);
    } catch (error) {
      console.error("Failed to restore seller:", error);
      alert("Failed to restore seller. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Suspension Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map((seller) => (
            <TableRow key={seller.id}>
              <TableCell className="font-medium">
                {seller.store_name}
                <div className="text-xs text-muted-foreground">{seller.business_type}</div>
              </TableCell>
              <TableCell>{(seller.profiles as any)?.full_name || (seller.profiles as any)?.[0]?.full_name || "Unknown"}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(seller.updated_at), { addSuffix: true })}</TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground" title={seller.rejection_reason || "No reason provided"}>
                {seller.rejection_reason || "No reason provided"}
              </TableCell>
              <TableCell>
                <Badge variant="destructive">
                  Suspended
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRestore(seller.id)}
                  disabled={processingId === seller.id}
                  className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  {processingId === seller.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Undo2 className="mr-2 h-4 w-4" />
                  )}
                  Restore
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {sellers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No suspended sellers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
