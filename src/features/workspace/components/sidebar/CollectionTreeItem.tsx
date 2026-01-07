import type { Collection } from "@/features/collections/models/collection.model"
import { useToggleCollectionFavoriteMutation } from "@/features/collections/hooks/useToggleCollectionFavorite"
import { useWorkspaceNavigation } from "../../hooks/useWorkspaceNavigation"
import { CollectionNotesEmpty } from "./collection-tree-item/CollectionNotesEmpty"
import { CollectionNotesList } from "./collection-tree-item/CollectionNotesList"
import { CollectionTreeHeader } from "./collection-tree-item/CollectionTreeHeader"

type WorkspaceMode = "default" | "favorites"

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
  mode = "default",
}: CollectionTreeItemProps) {
  const { navigateToNote } = useWorkspaceNavigation(mode)
  const toggleFavorite = useToggleCollectionFavoriteMutation()

  const notesCount = collection.notes?.length || 0
  const favorite = collection.isFavorite === true

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite.mutate({ collectionId: collection.id, next: !favorite })
  }

  return (
    <div>
      <CollectionTreeHeader
        collection={collection}
        isExpanded={isExpanded}
        isActive={isActive}
        notesCount={notesCount}
        favorite={favorite}
        onToggle={onToggle}
        onSelect={onSelect}
        onToggleFavorite={handleFavoriteClick}
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
    </div>
  )
}
