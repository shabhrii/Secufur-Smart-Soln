"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShieldCheck, Users, ShoppingBag, AlertTriangle, Menu } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const ADMIN_NAV_ITEMS = [
  { name: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: ShieldCheck },
  { name: "Users & Sellers", href: "#", icon: Users },
  { name: "All Orders", href: "#", icon: ShoppingBag },
  { name: "Moderation", href: "#", icon: AlertTriangle },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const NavLinks = () => (
    <>
      {ADMIN_NAV_ITEMS.map((item) => {
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

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden shrink-0" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-16 flex items-center px-6 border-b">
            <ShieldCheck className="w-5 h-5 text-primary mr-2" />
            <span className="font-bold">Admin Portal</span>
          </div>
          <div className="flex-1 py-4 px-3 space-y-1">
            <NavLinks />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-card hidden lg:block shrink-0">
        <div className="h-full flex flex-col sticky top-0 min-h-screen">
          <div className="h-16 flex items-center px-6 border-b">
            <ShieldCheck className="w-5 h-5 text-primary mr-2" />
            <span className="font-bold">Admin Portal</span>
          </div>
          
          <nav className="flex-1 py-4 px-3 space-y-1">
            <NavLinks />
          </nav>
        </div>
      </aside>
    </>
  )
}
