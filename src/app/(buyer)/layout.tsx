import { ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Buyer Top Navbar */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <Link href={ROUTES.HOME} className="text-xl font-bold tracking-tight">Secufur</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href={ROUTES.HOME} className="transition-colors hover:text-foreground/80 text-foreground/60">Marketplace</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Categories</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Deals</Link>
            <Link href={ROUTES.SELLER.HOME} className="transition-colors hover:text-foreground/80 text-foreground/60">Sell on Secufur</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.BUYER.CART} className="relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link href={ROUTES.AUTH.LOGIN} className="text-sm font-medium hover:underline underline-offset-4">Sign In</Link>
            <Link href={ROUTES.AUTH.REGISTER} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Buyer Footer */}
      <footer className="w-full border-t py-6 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:h-16 items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Secufur Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:underline underline-offset-4">Terms</Link>
            <Link href="#" className="hover:underline underline-offset-4">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
