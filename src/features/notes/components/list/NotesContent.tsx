import type { Note } from "../../models/note.model"
import { NotesGrid } from "./NotesGrid"
import { NotesListSkeleton } from "./NotesListSkeleton"
import { NotesEmptyState } from "./NotesEmptyState"
import { Button } from "@/components/ui/button"
import { NoteCard } from "./NoteCard"

interface NotesContentProps {
  loading: boolean
  error: string | null
  notes: Note[]
  view: "grid" | "list"
  onRetry: () => void
}

export function NotesContent({ loading, error, notes, view, onRetry }: Readonly<NotesContentProps>) {
  if (error) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      </div>
    )
  }

  if (loading) {
    return <NotesListSkeleton />
  }

  if (!notes.length) {
    return <NotesEmptyState />
  }

  if (view === "list") {
    return (
      <div className="space-y-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    )
  }

  return <NotesGrid items={notes} />
}
