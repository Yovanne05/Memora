import { useMemo } from "react"
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery"
import type { NotesFilters } from "@/features/notes/types/note-query"
import { useWorkspaceContext } from "../context/WorkspaceContext"

const SORT_MAP = {
  recent: { sortBy: "updated_at" as const, sortDir: "desc" as const },
  oldest: { sortBy: "updated_at" as const, sortDir: "asc" as const },
  "title-asc": { sortBy: "title" as const, sortDir: "asc" as const },
  "title-desc": { sortBy: "title" as const, sortDir: "desc" as const },
}

interface UseWorkspaceNotesOptions {
  collectionId?: string
}

export function useWorkspaceNotes(options: UseWorkspaceNotesOptions = {}) {
  const { collectionId } = options
  const { state } = useWorkspaceContext()

  const filters = useMemo<NotesFilters>(() => {
    const baseFilters: NotesFilters = {
      ...SORT_MAP[state.sort],
      titleContains: state.search.trim() || undefined,
    }

    if (collectionId) {
      baseFilters.collectionId = collectionId
    }

    return baseFilters
  }, [state.search, state.sort, collectionId])

  const notesQuery = useNotesQuery(state.page, state.limit, filters)

  return {
    notes: notesQuery.data?.items || [],
    total: notesQuery.data?.total || 0,
    offset: notesQuery.data?.offset || 0,
    limit: notesQuery.data?.limit || state.limit,
    isLoading: notesQuery.isLoading,
    isError: notesQuery.isError,
    error: notesQuery.error,
    refetch: notesQuery.refetch,
  }
}
