import { LayoutDashboard, Users, ShoppingBag, ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900/50">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-background hidden lg:block">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b">
            <ShieldCheck className="w-5 h-5 text-primary mr-2" />
            <span className="font-bold">Admin Portal</span>
          </div>
          
          <nav className="flex-1 py-4 px-3 space-y-1">
            <Link href={ROUTES.ADMIN.DASHBOARD} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Users className="w-4 h-4 mr-3" />
              Sellers
            </Link>
            <Link href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ShoppingBag className="w-4 h-4 mr-3" />
              Global Orders
            </Link>
          </nav>
          
          <div className="p-4 border-t">
            <Link href={ROUTES.HOME} className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Link>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center px-6 lg:hidden">
          <ShieldCheck className="w-5 h-5 text-primary mr-2" />
          <span className="font-bold">Admin Portal</span>
        </header>
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
