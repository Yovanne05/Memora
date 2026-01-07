import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type QuickAddNoteTriggerProps = {
  variant: "default" | "outline" | "ghost"
  size: "default" | "sm" | "lg" | "icon"
  showLabel: boolean
  onClick: () => void
}

export function QuickAddNoteTrigger({
  variant,
  size,
  showLabel,
  onClick,
}: Readonly<QuickAddNoteTriggerProps>) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={showLabel ? "gap-2" : ""}
    >
      <Plus className="h-4 w-4" />
      {showLabel && "Nouvelle note"}
    </Button>
  )
}
