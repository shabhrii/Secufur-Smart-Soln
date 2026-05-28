import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900/50 relative">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col min-w-0 lg:pl-0">
        <header className="h-16 border-b bg-background flex items-center px-6 lg:hidden sticky top-0 z-40">
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
