import { FlashcardForm } from "../FlashcardForm"
import type { FlashcardEditForm } from "../../schemas/flashcard.schema"

type FlashcardCreatePanelProps = {
  noteId: string
  isSubmitting: boolean
  onSubmit: (data: FlashcardEditForm) => void
  onCancel: () => void
}

export function FlashcardCreatePanel({
  noteId,
  isSubmitting,
  onSubmit,
  onCancel,
}: Readonly<FlashcardCreatePanelProps>) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="text-sm font-semibold mb-4">Nouvelle flashcard</h4>
      <FlashcardForm
        noteId={noteId}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
