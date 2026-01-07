import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type NoteLinkDialogFooterProps = {
  onCancel: () => void
  onSubmit: () => void
  isPending: boolean
  hasSelection: boolean
}

export function NoteLinkDialogFooter({
  onCancel,
  onSubmit,
  isPending,
  hasSelection,
}: Readonly<NoteLinkDialogFooterProps>) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Annuler
      </Button>
      <Button onClick={onSubmit} disabled={!hasSelection || isPending}>
        {isPending ? "Liaison..." : "Lier la note"}
      </Button>
    </DialogFooter>
  )
}
