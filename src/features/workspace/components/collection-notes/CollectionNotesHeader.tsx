import { Edit, Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickAddNote } from '@/features/notes/components/QuickAddNote'
import type { Collection } from '@/features/collections/models/collection.model'

type CollectionNotesHeaderProps = {
  collection: Collection | null
  collectionId: string
  onEdit: () => void
  onShare: () => void
  onDelete: () => void
  canAddNote: boolean
  canEdit: boolean
  canShare: boolean
  canDelete: boolean
}

export function CollectionNotesHeader({
  collection,
  collectionId,
  onEdit,
  onShare,
  onDelete,
  canAddNote,
  canEdit,
  canShare,
  canDelete,
}: Readonly<CollectionNotesHeaderProps>) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold">{collection?.name}</h2>
        {collection?.description && (
          <p className="mt-1 text-muted-foreground">{collection.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <QuickAddNote
          collectionId={collectionId}
          triggerVariant="default"
          showLabel
          disabled={!canAddNote}
        />
        <Button
          variant="outline"
          size="default"
          onClick={onShare}
          className="gap-2"
          disabled={!canShare}
        >
          <Users className="h-4 w-4" />
          Partager
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={onEdit}
          className="gap-2"
          disabled={!canEdit}
        >
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
        <Button
          variant="destructive"
          size="default"
          onClick={onDelete}
          className="gap-2"
          disabled={!canDelete}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  )
}
