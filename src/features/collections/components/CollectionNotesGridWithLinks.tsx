import { GridEmptyState, GridLoadingState } from "./GridStates"
import type { Note } from "@/features/notes/models/note.model"
import { CollectionNoteCardItem } from "./collection-notes-grid/CollectionNoteCardItem"

type CollectionNotesGridWithLinksProps = {
  readonly notes: Note[]
  readonly isLoading: boolean
  readonly isUpdating: boolean
  readonly onRemoveFromCollection: (noteId: string) => void
}

export function CollectionNotesGridWithLinks({
  notes,
  isLoading,
  isUpdating,
  onRemoveFromCollection,
}: Readonly<CollectionNotesGridWithLinksProps>) {
  if (isLoading) {
    return <GridLoadingState />
  }

  if (!notes.length) {
    return <GridEmptyState />
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {notes.map((note) => (
        <CollectionNoteCardItem
          key={note.id}
          note={note}
          allNotes={notes}
          isUpdating={isUpdating}
          onRemoveFromCollection={onRemoveFromCollection}
        />
      ))}
    </div>
  )
}
