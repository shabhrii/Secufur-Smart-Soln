"use client"

import * as React from "react"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  retry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this section.",
  retry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={`flex min-h-[300px] flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50 ${className || ""}`}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {message}
        </p>
        {retry && (
          <Button variant="outline" onClick={() => retry()} className="mt-2">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
