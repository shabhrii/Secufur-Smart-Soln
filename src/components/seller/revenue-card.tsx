import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RevenueCard() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">Interactive Chart Placeholder</p>
        </div>
      </CardContent>
    </Card>
  )
}
