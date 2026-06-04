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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Store, Package, Ban, Loader2 } from "lucide-react";
import { suspendSeller } from "@/services/admin/actions";

interface ApprovedSeller {
  id: string;
  store_name: string;
  business_type: string | null;
  status: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  product_count: number;
}

export function ApprovedSellersTable({ sellers }: { sellers: ApprovedSeller[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleSuspend(id: string) {
    const reason = window.prompt("Please provide a reason for suspension:");
    if (!reason) return; // Cancelled or empty

    try {
      setProcessingId(id);
      await suspendSeller(id, reason);
    } catch (error) {
      console.error("Failed to suspend seller:", error);
      alert("Failed to suspend seller. Please try again.");
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
            <TableHead>Products</TableHead>
            <TableHead>Join Date</TableHead>
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
              <TableCell>{seller.product_count}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(seller.created_at), { addSuffix: true })}</TableCell>
              <TableCell>
                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                  Approved
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 disabled:pointer-events-none disabled:opacity-50" disabled={processingId === seller.id}>
                    <span className="sr-only">Open menu</span>
                    {processingId === seller.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/sellers/${seller.id}`}>
                      <Store className="mr-2 h-4 w-4" />
                      View Store
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/products?seller=${seller.id}`}>
                      <Package className="mr-2 h-4 w-4" />
                      View Products
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => handleSuspend(seller.id)}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Suspend Seller
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {sellers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No approved sellers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
