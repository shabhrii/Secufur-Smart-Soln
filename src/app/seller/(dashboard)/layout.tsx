import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { Store } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/seller/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller" && profile?.role !== "admin") {
    redirect("/");
  }

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
