import * as React from "react"
import { cn } from "@/lib/utils"

type CommandInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onValueChange?: (value: string) => void
}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onChange, onValueChange, ...props }, ref) => (
    <div className="flex items-center border-b px-3">
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(event) => {
          onChange?.(event)
          onValueChange?.(event.target.value)
        }}
        {...props}
      />
    </div>
  )
)

CommandInput.displayName = "CommandInput"
