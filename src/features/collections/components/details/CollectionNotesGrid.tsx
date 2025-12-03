import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteCard } from "@/features/notes/components/list/NoteCard"
import type { Note } from "@/features/notes/models/note.model"
import { X, FileX } from "lucide-react"

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!notes.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">Aucune note</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Cette collection ne contient aucune note pour le moment. Ajoutez-en une pour commencer.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group relative space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-border/80"
        >
          <NoteCard note={note} />
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
