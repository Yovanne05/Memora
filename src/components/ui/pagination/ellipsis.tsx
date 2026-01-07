import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
    <span className="sr-only">Plus de pages</span>
  </span>
))

PaginationEllipsis.displayName = "PaginationEllipsis"
