"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  return (
    <div className="relative w-full max-w-md hidden md:flex items-center">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search for products, brands and more..."
        className="pl-10 w-full bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background"
      />
    </div>
  )
}
