"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Check, X, Loader2, Image as ImageIcon, ShieldAlert } from "lucide-react"
import { updateProductModerationStatus } from "@/services/admin/actions"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface PendingProduct {
  id: string;
  name: string;
  price: number;
  moderation_status: string;
  created_at: string;
  sellers: { store_name: string } | null;
  product_images: { image_url: string; is_primary: boolean }[] | null;
}

export function ModerationTable({ 
  products, 
  currentTab 
}: { 
  products: PendingProduct[]; 
  currentTab: string 
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleAction(id: string, status: "approved" | "rejected") {
    try {
      setProcessingId(id);
      await updateProductModerationStatus(id, status);
    } catch (err) {
      console.error("Failed to moderate product", err);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Product Moderation</CardTitle>
        <Button variant="outline" size="sm">
          <ShieldAlert className="w-4 h-4 mr-2" />
          View All Queue
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                    {product.product_images && product.product_images.length > 0 ? (
                      <Image 
                        src={product.product_images[0].image_url} 
                        alt={product.name} 
                        width={40} 
                        height={40} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>
                  {product.name}
                </TableCell>
                <TableCell>{product.sellers?.store_name || "Unknown"}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={
                    product.moderation_status === 'approved' ? 'default' : 
                    product.moderation_status === 'rejected' ? 'destructive' : 'secondary'
                  } className="capitalize">
                    {product.moderation_status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {(product.moderation_status === "pending_review" || product.moderation_status === "rejected") && (
                      <Button 
                        title="Approve Product"
                        variant="outline" 
                        size="sm"
                        className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleAction(product.id, "approved")}
                        disabled={processingId !== null}
                      >
                        {processingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                           product.moderation_status === "rejected" ? <RotateCcw className="w-4 h-4" /> : <Check className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    {(product.moderation_status === "pending_review" || product.moderation_status === "approved") && (
                      <Button 
                        title="Reject Product"
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleAction(product.id, "rejected")}
                        disabled={processingId !== null}
                      >
                        {processingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No products found in this queue.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
