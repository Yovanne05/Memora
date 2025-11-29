import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteCard } from "@/features/notes/components/NoteCard"
import type { Note } from "@/features/notes/models/note.model"

type CollectionNotesGridProps = {
  notes: Note[]
  isLoading: boolean
  isUpdating: boolean
  onRemoveFromCollection: (noteId: string) => void
}

export function CollectionNotesGrid({
  notes,
  isLoading,
  isUpdating,
  onRemoveFromCollection,
}: CollectionNotesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!notes.length) {
    return (
      <p className="text-xs text-muted-foreground">
        Aucune note dans cette collection.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="space-y-2 rounded-lg border p-3 transition hover:shadow-sm"
        >
          <NoteCard note={note} />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFromCollection(note.id)}
              disabled={isUpdating}
            >
              Retirer de la collection
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
