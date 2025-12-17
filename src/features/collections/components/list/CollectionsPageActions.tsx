import { Plus, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CollectionsKeyboardHelp } from "./CollectionsKeyboardHelp"

interface CollectionsPageActionsProps {
  readonly selectionMode: boolean
  readonly onToggleSelectionMode: () => void
  readonly onCreateClick: () => void
}

export function CollectionsPageActions({
  selectionMode,
  onToggleSelectionMode,
  onCreateClick,
}: Readonly<CollectionsPageActionsProps>) {
  return (
    <div className="flex gap-2">
      <CollectionsKeyboardHelp />
      <Button
        onClick={onToggleSelectionMode}
        size="lg"
        variant={selectionMode ? "default" : "outline"}
        className="gap-2"
        aria-label="Mode sélection"
      >
        <CheckSquare className="h-4 w-4" aria-hidden="true" />
        {selectionMode ? "Annuler" : "Sélectionner"}
      </Button>
      <Button
        onClick={onCreateClick}
        size="lg"
        className="gap-2"
        aria-label="Créer une nouvelle collection"
        disabled={selectionMode}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Nouvelle collection
      </Button>
    </div>
  )
}
