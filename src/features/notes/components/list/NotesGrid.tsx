import type { Note } from "../../models/note.model"
import { NoteCard } from "./NoteCard"

interface NotesGridProps {
  items: Note[]
  onEdit?: (n: Note) => void
  onDelete?: (n: Note) => void
}

export function NotesGrid({ items, onEdit, onDelete }: Readonly<NotesGridProps>) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((note) => (
        <NoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </section>
  )
}

