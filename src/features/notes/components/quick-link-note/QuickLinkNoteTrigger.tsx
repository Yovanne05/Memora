import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type QuickLinkNoteTriggerProps = {
  variant: "default" | "outline" | "ghost"
  size: "default" | "sm" | "lg" | "icon"
  showLabel: boolean
  disabled?: boolean
  title?: string
}

export function QuickLinkNoteTrigger({
  variant,
  size,
  showLabel,
  disabled,
  title,
}: Readonly<QuickLinkNoteTriggerProps>) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      title={title}
      className={showLabel ? "gap-2" : ""}
    >
      <Link2 className="h-4 w-4" />
      {showLabel && "Lier une note"}
    </Button>
  )
}
