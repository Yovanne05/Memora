import * as React from "react"
import { cn } from "@/lib/utils"

type CommandItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onSelect?: (value: string) => void
  value?: string
}

export const CommandItem = React.forwardRef<
  HTMLButtonElement,
  CommandItemProps
>(({ className, onClick, onSelect, value, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    onClick={(event) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        onSelect?.(value ?? "")
      }
    }}
    {...props}
  />
))

CommandItem.displayName = "CommandItem"
