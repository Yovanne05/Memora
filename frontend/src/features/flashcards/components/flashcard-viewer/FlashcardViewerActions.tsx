import { Button } from "@/components/ui/button"

type FlashcardViewerActionsProps = {
  showResult: boolean
  onReset: () => void
  onClose?: () => void
}

export function FlashcardViewerActions({
  showResult,
  onReset,
  onClose,
}: Readonly<FlashcardViewerActionsProps>) {
  return (
    <div className="flex items-center gap-2">
      {showResult && (
        <Button type="button" variant="outline" onClick={onReset} className="flex-1">
          Réessayer
        </Button>
      )}
      {onClose && (
        <Button
          type="button"
          variant={showResult ? "default" : "outline"}
          onClick={onClose}
          className="flex-1"
        >
          Fermer
        </Button>
      )}
    </div>
  )
}
