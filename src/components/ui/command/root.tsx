import * as React from "react"
import { cn } from "@/lib/utils"

type CommandProps = React.HTMLAttributes<HTMLDivElement> & {
  shouldFilter?: boolean
}

export const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  )
)

Command.displayName = "Command"
