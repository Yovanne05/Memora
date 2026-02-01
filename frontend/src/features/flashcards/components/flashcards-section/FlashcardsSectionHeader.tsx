import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type FlashcardsSectionHeaderProps = {
  count: number
  isCreating: boolean
  onStartCreate: () => void
}

export function FlashcardsSectionHeader({
  count,
  isCreating,
  onStartCreate,
}: Readonly<FlashcardsSectionHeaderProps>) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Flashcards ({count})
      </h3>
      {!isCreating && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onStartCreate}
          className="h-8 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Créer une flashcard
        </Button>
      )}
    </div>
  )
}
