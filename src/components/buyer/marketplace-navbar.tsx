import Link from "next/link"
import { Suspense } from "react"
import { ShieldCheck, Menu } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { SearchBar } from "./search-bar"
import { CartDrawer } from "./cart-drawer"
import { UserNav } from "@/components/shared/user-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export function MarketplaceNavbar() {
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <span className="font-bold">Secufur</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link href={ROUTES.HOME} className="text-lg font-medium hover:text-primary">Home</Link>
                <Link href="#" className="text-lg font-medium hover:text-primary">Categories</Link>
                <Link href="#" className="text-lg font-medium hover:text-primary">Today&apos;s Deals</Link>
                <Link href={ROUTES.SELLER.HOME} className="text-lg font-medium hover:text-primary">Sell on Secufur</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary md:w-8 md:h-8" />
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">Secufur</span>
          </Link>
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <Suspense fallback={<div className="w-full h-10 bg-muted/50 rounded-md hidden md:block animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Link href={ROUTES.SELLER.HOME} className="hidden lg:inline-flex text-sm font-medium hover:underline text-muted-foreground hover:text-foreground">
            Become a Seller
          </Link>
          <div className="h-6 w-px bg-border hidden lg:block mx-2"></div>
          
          <UserNav />
          <CartDrawer />
        </div>
      </div>
    </header>
  )
}
