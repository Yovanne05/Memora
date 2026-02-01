import * as React from "react"
import { cn } from "@/lib/utils"

export const PaginationContent = React.forwardRef<
  HTMLOListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-row flex-wrap items-center justify-center gap-1",
      className
    )}
    {...props}
  />
))

PaginationContent.displayName = "PaginationContent"
