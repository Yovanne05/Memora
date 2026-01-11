import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { Collection } from '@/features/collections/models/collection.model'
import { useToggleCollectionFavoriteMutation } from '@/features/collections/hooks/useToggleCollectionFavorite'
import { useWorkspaceNavigation } from '../../hooks/useWorkspaceNavigation'
import { CollectionNotesEmpty } from './collection-tree-item/CollectionNotesEmpty'
import { CollectionNotesList } from './collection-tree-item/CollectionNotesList'
import { CollectionTreeHeader } from './collection-tree-item/CollectionTreeHeader'
import { ReportDialog } from '@/features/report/components/ReportDialog'
import type { DroppableCollectionData } from '@/features/notes/hooks/useDragAndDropNotes'

type WorkspaceMode = 'default' | 'favorites'

interface CollectionTreeItemProps {
  collection: Collection
  isExpanded: boolean
  isActive: boolean
  selectedNoteId: string | null
  onToggle: () => void
  onSelect: () => void
  mode?: WorkspaceMode
}

export function CollectionTreeItem({
  collection,
  isExpanded,
  isActive,
  selectedNoteId,
  onToggle,
  onSelect,
  mode = 'default',
}: Readonly<CollectionTreeItemProps>) {
  const { navigateToNote } = useWorkspaceNavigation(mode)
  const toggleFavorite = useToggleCollectionFavoriteMutation()
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  const dropData: DroppableCollectionData = {
    collectionId: collection.id,
    collectionName: collection.name,
  }

  const { setNodeRef, isOver } = useDroppable({
    id: `collection-${collection.id}`,
    data: dropData,
  })

  const notesCount = collection.notes?.length || 0
  const favorite = collection.isFavorite === true

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite.mutate({ collectionId: collection.id, next: !favorite })
  }

  const handleReportClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setReportDialogOpen(true)
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-colors rounded-md',
        isOver && 'bg-accent/50 ring-2 ring-primary/50'
      )}
    >
      <CollectionTreeHeader
        collection={collection}
        isExpanded={isExpanded}
        isActive={isActive}
        notesCount={notesCount}
        favorite={favorite}
        onToggle={onToggle}
        onSelect={onSelect}
        onToggleFavorite={handleFavoriteClick}
        onOpenReport={handleReportClick}
        isFavoritePending={toggleFavorite.isPending}
      />

      {isExpanded && notesCount > 0 && (
        <CollectionNotesList
          collection={collection}
          selectedNoteId={selectedNoteId}
          onSelectNote={(noteId) => navigateToNote(noteId, collection.id)}
        />
      )}

      {isExpanded && notesCount === 0 && <CollectionNotesEmpty />}

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        targetType="collection"
        targetId={collection.id}
        targetTitle={collection.name}
      />
    </div>
  )
}
