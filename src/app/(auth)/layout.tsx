import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/40">
      {/* Decorative Side */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight">Secufur</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-4">The Next Generation Marketplace Foundation</h2>
          <p className="text-slate-400">Join the premier platform for buyers and sellers, built with scalable enterprise architecture.</p>
        </div>
      </div>
      
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-background">
        <div className="absolute top-6 left-6 md:hidden flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Secufur</span>
        </div>
        <div className="absolute top-6 right-6">
          <Link href={ROUTES.HOME} className="text-sm font-medium hover:underline text-muted-foreground">
            Back to Home
          </Link>
        </div>
        
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
