import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 text-white shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
      
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[100px] mix-blend-screen translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary rounded-full blur-[80px] mix-blend-screen translate-y-1/2" />
      </div>

      <div className="relative z-20 container mx-auto px-8 py-16 md:py-24 flex flex-col items-start justify-center min-h-[400px]">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 text-sm font-medium backdrop-blur-sm">
            ✨ Spring Collection 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Discover Premium Quality Products
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-lg">
            Shop from thousands of verified sellers offering the best deals on the market. Secure checkout and fast delivery guaranteed.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-full px-8">
              Explore Deals
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
