import { NotesGrid } from "@/features/notes/components/NotesGrid"
import { NotesPagination } from "@/features/notes/components/NotesPagination"
import type { Note } from "@/features/notes/models/note.model"

type CollectionNotesListProps = {
  notes: Note[]
  page: number
  maxPage: number
  showPagination: boolean
  onPageChange: (page: number) => void
}

export function CollectionNotesList({
  notes,
  page,
  maxPage,
  showPagination,
  onPageChange,
}: Readonly<CollectionNotesListProps>) {
  return (
    <>
      <NotesGrid items={notes} showQuickActions showFavoriteButton />
      {showPagination && <NotesPagination page={page} maxPage={maxPage} setPage={onPageChange} />}
    </>
  )
}
