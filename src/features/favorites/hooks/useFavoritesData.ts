import { useMemo } from 'react'
import { getContextualErrorMessage } from '@/lib/error-context'
import { useNotesQuery } from '@/features/notes/hooks/useNotesQuery'
import { useCollectionsQuery } from '@/features/collections/hooks/useCollectionsQuery'
import type { NotesFilters } from '@/features/notes/types/note-query'

const DEFAULT_SORT = {
  sortBy: 'updated_at' as const,
  sortDir: 'desc' as const,
}

export function useFavoritesData() {
  const filters = useMemo<NotesFilters>(
    () => ({
      ...DEFAULT_SORT,
      isFavorite: true,
    }),
    []
  )

  const collectionFilters = useMemo(
    () => ({
      sortBy: 'updated_at' as const,
      sortDir: 'desc' as const,
      isFavorite: true,
    }),
    []
  )

  const notesQuery = useNotesQuery(1, 100, filters)
  const collectionsQuery = useCollectionsQuery(collectionFilters)

  const isLoading = notesQuery.isLoading || collectionsQuery.isLoading
  const isError = notesQuery.isError || collectionsQuery.isError

  let errorMessage = 'Une erreur est survenue'
  if (notesQuery.error) {
    errorMessage = getContextualErrorMessage(notesQuery.error, {
      operation: 'fetch',
      resource: 'note',
      fallback: 'Une erreur est survenue',
    })
  } else if (collectionsQuery.error) {
    errorMessage = getContextualErrorMessage(collectionsQuery.error, {
      operation: 'fetch',
      resource: 'collection',
      fallback: 'Une erreur est survenue',
    })
  }

  const notes = notesQuery.data?.items ?? []
  const collections = collectionsQuery.data?.items ?? []
  const hasContent = notes.length > 0 || collections.length > 0

  return {
    isLoading,
    isError,
    errorMessage,
    notes,
    collections,
    hasContent,
  }
}
