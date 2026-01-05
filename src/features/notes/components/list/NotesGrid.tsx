import type { Note } from "../../models/note.model"
import { NoteCard } from "./NoteCard"

interface NotesGridProps {
  items: Note[]
}

export function NotesGrid({ items }: Readonly<NotesGridProps>) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </section>
  )
}

