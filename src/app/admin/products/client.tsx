"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductsTabsClientProps {
  initialTab: string;
}

export function ProductsTabsClient({ initialTab }: ProductsTabsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="mb-6">
      <Tabs value={initialTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="pending_review" disabled={isPending}>Pending</TabsTrigger>
          <TabsTrigger value="approved" disabled={isPending}>Approved</TabsTrigger>
          <TabsTrigger value="rejected" disabled={isPending}>Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
