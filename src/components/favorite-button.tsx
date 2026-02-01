import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  readonly pressed: boolean
  readonly label: string
  readonly disabled?: boolean
  readonly onClick: (e: React.MouseEvent) => void
  readonly size?: "sm" | "md"
  readonly className?: string
}

export function FavoriteButton({
  pressed,
  label,
  disabled,
  onClick,
  size = "md",
  className,
}: Readonly<Props>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(size === "md" ? "h-9 w-9" : "h-8 w-8", className)}
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      disabled={disabled}
    >
      <Star
        className={cn(
          "h-4 w-4 transition",
          pressed ? "fill-current text-primary" : "text-muted-foreground"
        )}
        aria-hidden="true"
      />
    </Button>
  )
}
