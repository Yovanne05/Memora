import type { Note } from '../models/note.model'
import { NoteCard } from './NoteCard'

interface NotesGridProps {
  items: Note[]
  showQuickActions?: boolean
  showFavoriteButton?: boolean
  showReportButton?: boolean
}

export function NotesGrid({
  items,
  showQuickActions = false,
  showFavoriteButton = false,
  showReportButton = true,
}: Readonly<NotesGridProps>) {
  return (
    <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          showQuickActions={showQuickActions}
          showFavoriteButton={showFavoriteButton}
          showReportButton={showReportButton}
        />
      ))}
    </section>
  )
}
