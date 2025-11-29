import { Edit3, Plus, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollectionActionsProps {
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

export function CollectionActions({
  onEdit,
  onDelete,
  isDeleting,
}: CollectionActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={onEdit}
        disabled={isDeleting}
        aria-label="Modifier la collection"
      >
        <Edit3 className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Modifier
      </Button>
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled
        title="Bientôt disponible"
      >
        <Share2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Partager
      </Button>
      <Button
        size="sm"
        type="button"
        disabled
        aria-label="Créer une nouvelle note"
      >
        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Nouvelle note
      </Button>
      <Button
        variant="destructive"
        size="sm"
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label="Supprimer la collection"
      >
        <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Supprimer
      </Button>
    </div>
  )
}
