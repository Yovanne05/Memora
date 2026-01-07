import * as React from "react"
import { cn } from "@/lib/utils"

export const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & { isActive?: boolean }
>(({ className, isActive, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isActive &&
        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      className
    )}
    aria-current={isActive ? "page" : undefined}
    {...props}
  >
    {children ?? (
      <span className="sr-only">
        {typeof props["aria-label"] === "string" ? props["aria-label"] : "Page"}
      </span>
    )}
  </a>
))

PaginationLink.displayName = "PaginationLink"
