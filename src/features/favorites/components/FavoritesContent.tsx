import { NotesGrid } from '@/features/notes/components/NotesGrid'
import { FavoritesCollectionsWithActions } from './FavoritesCollectionsWithActions'
import type { Collection } from '@/features/collections/models/collection.model'
import type { Note } from '@/features/notes/models/note.model'

type FavoritesContentProps = {
  collections: Collection[]
  notes: Note[]
}

export function FavoritesContent({
  collections,
  notes,
}: Readonly<FavoritesContentProps>) {
  return (
    <>
      {collections.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Collections</h2>
          <FavoritesCollectionsWithActions collections={collections} />
        </div>
      )}

      {notes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Notes</h2>
          <NotesGrid items={notes} showQuickActions showFavoriteButton />
        </div>
      )}
    </>
  )
}
