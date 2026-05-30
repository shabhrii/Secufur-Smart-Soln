"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingBag, Settings, Store, Menu } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const SELLER_NAV_ITEMS = [
  { name: "Dashboard", href: ROUTES.SELLER.DASHBOARD, icon: LayoutDashboard },
  { name: "Products", href: "/seller/products", icon: Package },
  { name: "Orders", href: "#", icon: ShoppingBag },
  { name: "Settings", href: "#", icon: Settings },
]

const NavLinks = ({ pathname }: { pathname: string }) => (
  <>
    {SELLER_NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href
      return (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="w-4 h-4" />
          {item.name}
        </Link>
      )
    })}
  </>
)

export function SellerSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden shrink-0" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-16 flex items-center px-6 border-b">
            <Store className="w-5 h-5 text-primary mr-2" />
            <span className="font-bold">Seller Portal</span>
          </div>
          <div className="flex-1 py-4 px-3 space-y-1">
            <NavLinks pathname={pathname} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block shrink-0">
        <div className="h-full flex flex-col sticky top-0 min-h-screen">
          <div className="h-16 flex items-center px-6 border-b">
            <Store className="w-5 h-5 text-primary mr-2" />
            <span className="font-bold">Seller Portal</span>
          </div>
          
          <nav className="flex-1 py-4 px-3 space-y-1">
            <NavLinks pathname={pathname} />
          </nav>
        </div>
      </aside>
    </>
  )
}
