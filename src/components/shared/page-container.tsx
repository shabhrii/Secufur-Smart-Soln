import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export function PageContainer({
  className,
  as: Component = "div",
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn("container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl", className)}
      {...props}
    />
  )
}
