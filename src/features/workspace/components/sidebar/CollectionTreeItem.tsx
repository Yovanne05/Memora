import { ChevronRight, FolderClosed, Files } from "lucide-react"
import type { Collection } from "@/features/collections/models/collection.model"
import { cn } from "@/lib/utils"
import { NoteTreeItem } from "./NoteTreeItem"
import { useWorkspaceNavigation } from "../../hooks/useWorkspaceNavigation"
import { useToggleCollectionFavoriteMutation } from "@/features/collections/hooks/useToggleCollectionFavorite"
import { FavoriteButton } from "@/components/favorite-button"

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite.mutate({ collectionId: collection.id, next: !favorite })
  }

  return (
    <div>
      {/* Collection header */}
      <div className="flex items-center gap-1 group">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
          aria-label={isExpanded ? "Replier" : "Déplier"}
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </button>

        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-accent text-accent-foreground font-medium"
          )}
        >
          <FolderClosed className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-left">{collection.name}</span>

          {notesCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Files className="h-3 w-3" />
              {notesCount}
            </span>
          )}

          <span className="ml-1">
            <FavoriteButton
              pressed={favorite}
              label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              disabled={toggleFavorite.isPending}
              onClick={handleFavoriteClick}
              size="sm"
              className={cn(
                "h-7 w-7",
                !favorite && "opacity-0 group-hover:opacity-100",
                "text-muted-foreground hover:text-foreground"
              )}
            />
          </span>
        </button>
      </div>

      {/* Notes list (if expanded) */}
      {isExpanded && notesCount > 0 && (
        <div className="ml-6 mt-1 space-y-0.5 border-l pl-2">
          {collection.notes.map((note) => (
            <NoteTreeItem
              key={note.id}
              note={note}
              isActive={selectedNoteId === note.id}
              onClick={() => navigateToNote(note.id, collection.id)}
            />
          ))}
        </div>
      )}

      {/* Empty state (if expanded but no notes) */}
      {isExpanded && notesCount === 0 && (
        <div className="ml-6 mt-1 border-l pl-2">
          <p className="px-3 py-1.5 text-xs text-muted-foreground">
            Aucune note
          </p>
        </div>
      )}
    </div>
  )
}
