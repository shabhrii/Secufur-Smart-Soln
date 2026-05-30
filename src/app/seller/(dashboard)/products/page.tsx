import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SectionHeader } from "@/components/shared/section-header"
import { fetchSellerProducts } from "@/services/seller-products"
import { Button, buttonVariants } from "@/components/ui/button"
import { Plus, Edit, MoreHorizontal, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteProduct, archiveProduct } from "@/services/seller-products/actions"

export default async function SellerProductsPage() {
  const products = await fetchSellerProducts()

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader 
          title="Products" 
          description="Manage your inventory, pricing, and product listings." 
          className="mb-0"
        />
        <Link href="/seller/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  You haven't added any products yet.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
                  || product.product_images?.[0]?.image_url
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                        {primaryImage ? (
                          <div 
                            className="w-full h-full object-cover"
                            style={{ backgroundImage: `url(${primaryImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.categories?.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        product.status === "active" ? "default" :
                        product.status === "archived" ? "secondary" : "outline"
                      }>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stock_quantity <= 0 ? "text-destructive font-medium" : ""}>
                        {product.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Link href={`/seller/products/${product.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-destructive p-0">
                              <form action={deleteProduct.bind(null, product.id)} className="w-full">
                                <button type="submit" className="w-full flex items-center px-2 py-1.5 cursor-pointer">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </button>
                              </form>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  )
}
