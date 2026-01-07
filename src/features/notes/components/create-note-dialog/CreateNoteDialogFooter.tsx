import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type CreateNoteDialogFooterProps = {
  titleValue: string
  submitting: boolean
  isFormDisabled: boolean
  onCancel: () => void
}

export function CreateNoteDialogFooter({
  titleValue,
  submitting,
  isFormDisabled,
  onCancel,
}: Readonly<CreateNoteDialogFooterProps>) {
  return (
    <DialogFooter className="gap-2">
      <Button variant="ghost" type="button" onClick={onCancel} disabled={isFormDisabled}>
        Annuler
      </Button>
      <Button type="submit" disabled={isFormDisabled || !titleValue.trim()}>
        {submitting ? "Création..." : "Créer"}
      </Button>
    </DialogFooter>
  )
}
