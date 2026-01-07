import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

type NoteQuickActionsTriggerProps = {
  isPending: boolean
  triggerVariant: "ghost" | "outline" | "default"
  showLabel: boolean
}

export function NoteQuickActionsTrigger({
  isPending,
  triggerVariant,
  showLabel,
}: Readonly<NoteQuickActionsTriggerProps>) {
  return (
    <Button
      variant={triggerVariant}
      size={showLabel ? "sm" : "icon"}
      className={showLabel ? "gap-2" : ""}
      disabled={isPending}
    >
      <MoreVertical className="h-4 w-4" />
      {showLabel && "Actions"}
    </Button>
  )
}
