import { Button } from "@/components/ui/button"

type FlashcardFormActionsProps = {
  isSubmitting: boolean
  onCancel?: () => void
}

export function FlashcardFormActions({
  isSubmitting,
  onCancel,
}: Readonly<FlashcardFormActionsProps>) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button type="submit" disabled={isSubmitting} className="flex-1">
        {isSubmitting ? "Création..." : "Créer la flashcard"}
      </Button>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
      )}
    </div>
  )
}
