import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormLabel } from "@/components/ui/form"
import { MAX_ANSWERS } from "../../types/flashcard-form.constants"

type FlashcardAnswersHeaderProps = {
  count: number
  isSubmitting: boolean
  onAdd: () => void
}

export function FlashcardAnswersHeader({
  count,
  isSubmitting,
  onAdd,
}: Readonly<FlashcardAnswersHeaderProps>) {
  return (
    <div className="flex items-center justify-between">
      <FormLabel>Réponses ({count}/{MAX_ANSWERS})</FormLabel>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onAdd}
        disabled={count >= MAX_ANSWERS || isSubmitting}
        className="h-8 gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter
      </Button>
    </div>
  )
}



