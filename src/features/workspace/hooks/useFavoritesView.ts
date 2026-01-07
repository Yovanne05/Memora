import { useMemo } from "react"

import { useWorkspaceContext } from "../context/WorkspaceContext"
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery"
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { NotesFilters } from "@/features/notes/types/note-query"

const SORT_MAP = {
  recent: { sortBy: "updated_at" as const, sortDir: "desc" as const },
  oldest: { sortBy: "updated_at" as const, sortDir: "asc" as const },
  "title-asc": { sortBy: "title" as const, sortDir: "asc" as const },
  "title-desc": { sortBy: "title" as const, sortDir: "desc" as const },
}

export function useFavoritesView() {
  const { state } = useWorkspaceContext()

  const filters = useMemo<NotesFilters>(() => {
    const sort = SORT_MAP[state.sort] ?? SORT_MAP.recent
    return {
      ...sort,
      titleContains: state.search.trim() || undefined,
      isFavorite: true,
    }
  }, [state.search, state.sort])

  const collectionFilters = useMemo(() => {
    const sort = SORT_MAP[state.sort] ?? SORT_MAP.recent
    return {
      sortBy: sort.sortBy === "title" ? ("title" as const) : ("updated_at" as const),
      sortDir: sort.sortDir,
      titleContains: state.search.trim() || undefined,
      isFavorite: true,
    }
  }, [state.search, state.sort])

  const notesQuery = useNotesQuery(state.page, state.limit, filters)
  const collectionsQuery = useCollectionsQuery(collectionFilters)

  const isLoading = notesQuery.isLoading || collectionsQuery.isLoading
  const isError = notesQuery.isError || collectionsQuery.isError

  let errorMessage = "Une erreur est survenue"
  if (notesQuery.error instanceof Error) {
    errorMessage = notesQuery.error.message
  } else if (collectionsQuery.error instanceof Error) {
    errorMessage = collectionsQuery.error.message
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

