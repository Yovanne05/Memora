import { useMemo } from 'react'
import { useNotesQuery } from '@/features/notes/hooks/useNotesQuery'
import type { NotesFilters } from '@/features/notes/types/note-query'
import { useWorkspaceContext } from '../context'
import { useWorkspaceAccessScope } from './useWorkspaceAccessScope'

const SORT_MAP = {
  recent: { sortBy: 'updated_at' as const, sortDir: 'desc' as const },
  oldest: { sortBy: 'updated_at' as const, sortDir: 'asc' as const },
  'title-asc': { sortBy: 'title' as const, sortDir: 'asc' as const },
  'title-desc': { sortBy: 'title' as const, sortDir: 'desc' as const },
}
const FETCH_LIMIT = 200

interface UseWorkspaceNotesOptions {
  collectionId?: string
  favorites?: boolean
  orphansOnly?: boolean
}

export function useWorkspaceNotes(options: UseWorkspaceNotesOptions = {}) {
  const { collectionId, favorites, orphansOnly } = options
  const { state } = useWorkspaceContext()
  const {
    userId,
    sharedNoteIds,
    sharedCollectionIds,
    isLoading: isAccessLoading,
    isError: isAccessError,
    error: accessError,
  } = useWorkspaceAccessScope()

  const filters = useMemo<NotesFilters>(() => {
    const baseFilters: NotesFilters = {
      ...SORT_MAP[state.sort],
      titleContains: state.search.trim() || undefined,
    }

    if (collectionId) {
      baseFilters.collectionId = collectionId
    }

    if (favorites) {
      baseFilters.isFavorite = true
    }

    return baseFilters
  }, [state.search, state.sort, collectionId, favorites])

  const notesQuery = useNotesQuery(0, FETCH_LIMIT, filters)

  const scopedNotes = useMemo(() => {
    const items = notesQuery.data?.items ?? []
    if (!userId) return items

    let filtered = items.filter((note) => {
      if (note.ownerId === userId) return true
      if (note.collectionId && sharedCollectionIds.has(note.collectionId)) {
        return true
      }
      return sharedNoteIds.has(note.id)
    })

    if (orphansOnly) {
      filtered = filtered.filter((note) => !note.collectionId)
    }

    return filtered
  }, [
    notesQuery.data?.items,
    userId,
    sharedCollectionIds,
    sharedNoteIds,
    orphansOnly,
  ])

  const pagedNotes = useMemo(() => {
    const start = state.page * state.limit
    return scopedNotes.slice(start, start + state.limit)
  }, [scopedNotes, state.page, state.limit])

  return {
    notes: pagedNotes,
    total: userId ? scopedNotes.length : (notesQuery.data?.total ?? 0),
    offset: state.page * state.limit,
    limit: state.limit,
    isLoading: notesQuery.isLoading || isAccessLoading,
    isError: notesQuery.isError || isAccessError,
    error: notesQuery.error ?? accessError,
    refetch: notesQuery.refetch,
  }
}
