import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { Store } from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/40 relative">
      <SellerSidebar />
      
      <main className="flex-1 flex flex-col min-w-0 md:pl-0">
        <header className="h-16 border-b bg-background flex items-center px-6 md:hidden sticky top-0 z-40">
          <Store className="w-5 h-5 text-primary mr-2" />
          <span className="font-bold">Seller Portal</span>
        </header>
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
