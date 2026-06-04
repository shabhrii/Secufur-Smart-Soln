import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { getSellerDetails } from "@/services/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, User, Mail, Package, ShoppingCart, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSellerDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  let seller;
  try {
    seller = await getSellerDetails(id);
  } catch (error) {
    console.error("Error fetching seller details:", error);
    notFound();
  }

  if (!seller) {
    notFound();
  }

  const profile = Array.isArray(seller.profiles) ? seller.profiles[0] : seller.profiles;

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <SectionHeader
          title={seller.store_name}
          description="Detailed view of the seller and their store performance."
        />
        <Badge variant={seller.status === "approved" ? "default" : seller.status === "suspended" ? "destructive" : "secondary"} className="text-sm px-3 py-1">
          {seller.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Profile</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seller.store_name}</div>
            <p className="text-xs text-muted-foreground">
              {seller.business_type || "Individual Seller"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner Info</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">{profile?.full_name || "Unknown Owner"}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1 truncate">
              <Mail className="h-3 w-3 mr-1" />
              {profile?.email || "No email available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seller.products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total listed products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seller.orderCount}</div>
            <p className="text-xs text-muted-foreground">Total unique orders</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Products Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Moderation Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seller.products?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      product.moderation_status === 'approved' ? 'default' : 
                      product.moderation_status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }>
                      {product.moderation_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!seller.products || seller.products.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    This seller has no products listed.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
