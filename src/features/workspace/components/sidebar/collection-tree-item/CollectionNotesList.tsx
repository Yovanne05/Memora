import type { Collection } from "@/features/collections/models/collection.model"
import { NoteTreeItem } from "../NoteTreeItem"

type CollectionNotesListProps = {
  collection: Collection
  selectedNoteId: string | null
  onSelectNote: (noteId: string) => void
}

export function CollectionNotesList({
  collection,
  selectedNoteId,
  onSelectNote,
}: Readonly<CollectionNotesListProps>) {
  return (
    <div className="ml-6 mt-1 space-y-0.5 border-l pl-2">
      {collection.notes?.map((note) => (
        <NoteTreeItem
          key={note.id}
          note={note}
          isActive={selectedNoteId === note.id}
          onClick={() => onSelectNote(note.id)}
        />
      ))}
    </div>
  )
}
