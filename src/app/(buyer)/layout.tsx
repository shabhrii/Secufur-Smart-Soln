import { MarketplaceNavbar } from "@/components/buyer/marketplace-navbar";
import Link from "next/link";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketplaceNavbar />
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Buyer Footer */}
      <footer className="w-full border-t py-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Secufur Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

