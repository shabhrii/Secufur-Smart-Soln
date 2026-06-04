"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface UsersPageClientProps {
  initialQuery: string;
  initialRole: string;
}

export function UsersPageClient({ initialQuery, initialRole }: UsersPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(query, initialRole);
  };

  const handleRoleChange = (value: string | null) => {
    if (value) {
      updateURL(query, value);
    }
  };

  const updateURL = (q: string, r: string) => {
    const params = new URLSearchParams();
    if (q) params.set("query", q);
    if (r && r !== "all") params.set("role", r);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border mt-6">
      <form onSubmit={handleSearch} className="relative w-full sm:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name or email..."
          className="pl-8 bg-background"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
        />
      </form>
      
      <div className="w-full sm:w-48">
        <Select value={initialRole} onValueChange={handleRoleChange} disabled={isPending}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
