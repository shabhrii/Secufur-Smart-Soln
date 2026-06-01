"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Truck, Package, XCircle, Loader2, AlertCircle } from "lucide-react"
import { updateOrderStatus } from "@/services/orders/actions"
import { type OrderStatus } from "@/types/database"

interface OrderStatusActionsProps {
  orderId: string
  currentStatus: OrderStatus
}

interface StatusAction {
  label: string
  newStatus: OrderStatus
  icon: React.ReactNode
  variant: "default" | "destructive" | "outline"
}

function getAvailableActions(status: OrderStatus): StatusAction[] {
  switch (status) {
    case "pending":
      return [
        { label: "Confirm Order", newStatus: "confirmed", icon: <CheckCircle2 className="h-4 w-4 mr-2" />, variant: "default" },
        { label: "Cancel Order", newStatus: "cancelled", icon: <XCircle className="h-4 w-4 mr-2" />, variant: "destructive" },
      ]
    case "confirmed":
      return [
        { label: "Mark Shipped", newStatus: "shipped", icon: <Truck className="h-4 w-4 mr-2" />, variant: "default" },
        { label: "Cancel Order", newStatus: "cancelled", icon: <XCircle className="h-4 w-4 mr-2" />, variant: "destructive" },
      ]
    case "shipped":
      return [
        { label: "Mark Delivered", newStatus: "delivered", icon: <Package className="h-4 w-4 mr-2" />, variant: "default" },
      ]
    default:
      return []
  }
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const actions = getAvailableActions(currentStatus)

  if (actions.length === 0) {
    return null
  }

  const handleAction = async (newStatus: OrderStatus) => {
    setIsLoading(newStatus)
    setError(null)

    const result = await updateOrderStatus(orderId, newStatus)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Failed to update status.")
    }

    setIsLoading(null)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.newStatus}
            variant={action.variant}
            onClick={() => handleAction(action.newStatus)}
            disabled={isLoading !== null}
          >
            {isLoading === action.newStatus ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              action.icon
            )}
            {action.label}
          </Button>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
