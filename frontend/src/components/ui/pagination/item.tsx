import * as React from "react"
import { cn } from "@/lib/utils"

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("flex items-center", className)} {...props} />
))

PaginationItem.displayName = "PaginationItem"
