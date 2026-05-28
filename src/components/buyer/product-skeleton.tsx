import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full border-border/50">
      <Skeleton className="w-full aspect-square rounded-none" />
      <CardContent className="flex-1 p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-1/3 mb-1" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center gap-1 mt-auto pt-2">
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-5 w-1/3 mt-1" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
