import { ShieldCheck, ArrowRight, ShoppingCart, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Placeholder */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Secufur</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Marketplace</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Solutions</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Resources</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">Sign In</Link>
            <Link href="#" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="w-full py-24 lg:py-32 xl:py-48 flex-1 flex items-center relative overflow-hidden">
          {/* Background Gradient Decorative */}
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Introducing Secufur Multi-Vendor Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter sm:text-5xl max-w-4xl text-balance">
              The Next Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Marketplace</span> Foundation
            </h1>
            
            <p className="max-w-[700px] text-muted-foreground md:text-xl text-balance">
              A highly scalable, secure, and performant commercial multi-vendor marketplace platform built for modern businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="#" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 gap-2">
                Explore Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8">
                Become a Seller
              </Link>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Seamless Buying</h3>
                <p className="text-muted-foreground text-sm">Experience a frictionless purchasing journey with our optimized buyer portal.</p>
              </div>
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Seller Empowerment</h3>
                <p className="text-muted-foreground text-sm">Comprehensive dashboard and tools for sellers to manage inventory and sales.</p>
              </div>
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">High Performance</h3>
                <p className="text-muted-foreground text-sm">Built on Next.js 15 and edge infrastructure for blazing fast response times.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Placeholder */}
      <footer className="w-full border-t py-6 md:py-0 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:h-16 items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
          <p>© 2026 Secufur Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:underline underline-offset-4">Terms</Link>
            <Link href="#" className="hover:underline underline-offset-4">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
