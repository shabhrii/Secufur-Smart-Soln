import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Settings, Tag } from "lucide-react"

export function QuickActionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button className="w-full justify-start" variant="outline">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Tag className="w-4 h-4 mr-2" />
          Create Discount Code
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Store Settings
        </Button>
      </CardContent>
    </Card>
  )
}
