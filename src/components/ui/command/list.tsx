import * as React from "react"
import { cn } from "@/lib/utils"

export const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-60 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = "CommandList"
