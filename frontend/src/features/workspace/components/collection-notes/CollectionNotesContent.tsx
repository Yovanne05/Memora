import type { Note } from '@/features/notes/models/note.model'
import { CollectionNotesList } from './CollectionNotesList'
import { CollectionNotesEmpty } from './CollectionNotesEmpty'

type CollectionNotesContentProps = {
  notes: Note[] | null
  collectionId: string
  page: number
  maxPage: number
  total: number
  limit: number
  canAddNote: boolean
  onPageChange: (page: number) => void
}

export function CollectionNotesContent({
  notes,
  collectionId,
  page,
  maxPage,
  total,
  limit,
  canAddNote,
  onPageChange,
}: Readonly<CollectionNotesContentProps>) {
  if (notes && notes.length > 0) {
    return (
      <CollectionNotesList
        notes={notes}
        page={page}
        maxPage={maxPage}
        showPagination={total > limit}
        onPageChange={onPageChange}
      />
    )
  }

  return (
    <CollectionNotesEmpty collectionId={collectionId} canAddNote={canAddNote} />
  )
}
