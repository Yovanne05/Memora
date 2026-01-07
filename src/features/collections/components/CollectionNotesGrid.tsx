import { Button } from "@/components/ui/button"
import { NoteCard } from "@/features/notes/components/NoteCard"
import type { Note } from "@/features/notes/models/note.model"
import { X } from "lucide-react"
import { GridLoadingState, GridEmptyState } from "./GridStates"

type CollectionNotesGridProps = {
  readonly notes: Note[]
  readonly isLoading: boolean
  readonly isUpdating: boolean
  readonly onRemoveFromCollection: (noteId: string) => void
}

export function CollectionNotesGrid({
  notes,
  isLoading,
  isUpdating,
  onRemoveFromCollection,
}: Readonly<CollectionNotesGridProps>) {
  if (isLoading) {
    return <GridLoadingState />
  }

  if (!notes.length) {
    return <GridEmptyState />
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group relative space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-border/80"
        >
          <NoteCard note={note} showFavoriteButton />
          <div className="flex justify-end border-t border-border/50 pt-3 mt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFromCollection(note.id)}
              disabled={isUpdating}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Retirer
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
