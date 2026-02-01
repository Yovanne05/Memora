import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

type FlashcardsEmptyProps = {
  onStartCreate: () => void
}

export function FlashcardsEmpty({ onStartCreate }: Readonly<FlashcardsEmptyProps>) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground mb-3">
        Aucune flashcard pour cette note
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onStartCreate}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Créer la première flashcard
      </Button>
    </div>
  )
}
