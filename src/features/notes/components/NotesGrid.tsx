import type { Note } from "../models/note.model"
import { NoteCard } from "./NoteCard"

interface NotesGridProps {
  items: Note[]
  showQuickActions?: boolean
  showFavoriteButton?: boolean
}

export function NotesGrid({
  items,
  showQuickActions = false,
  showFavoriteButton = false
}: Readonly<NotesGridProps>) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          showQuickActions={showQuickActions}
          showFavoriteButton={showFavoriteButton}
        />
      ))}
    </section>
  )
}

