import { useCallback, useMemo, useState } from "react"
import type { NotesFilters } from "../types/note-query"
import { useNotesQuery } from "./useNotesQuery"

export type NotesView = "grid" | "list"
export type NotesSort = "recent" | "oldest" | "title-asc" | "title-desc"

const SORT_MAP: Record<NotesSort, Pick<NotesFilters, "sortBy" | "sortDir">> = {
  recent: { sortBy: "updated_at", sortDir: "desc" },
  oldest: { sortBy: "updated_at", sortDir: "asc" },
  "title-asc": { sortBy: "title", sortDir: "asc" },
  "title-desc": { sortBy: "title", sortDir: "desc" },
}

export function useNotesManager(initialLimit = 12) {
  const [page, setPage] = useState(0)
  const [limit] = useState(initialLimit)
  const [search, setSearch] = useState("")
  const [visibility, setVisibility] = useState<NotesFilters["visibility"]>()
  const [sort, setSort] = useState<NotesSort>("recent")
  const [view, setView] = useState<NotesView>("grid")

  const filters = useMemo<NotesFilters>(() => {
    const sortConfig = SORT_MAP[sort]
    const title = search.trim()
    return {
      ...sortConfig,
      titleContains: title || undefined,
      visibility,
    }
  }, [search, sort, visibility])

  const query = useNotesQuery(page, limit, filters)

  const reset = useCallback(() => {
    setSearch("")
    setVisibility(undefined)
    setSort("recent")
    setPage(0)
  }, [])

  const total = query.data?.total ?? 0
  const items = query.data?.items ?? []
  const maxPage = Math.max(0, Math.ceil(total / limit) - 1)

  return {
    data: items,
    total,
    page,
    maxPage,
    view,
    filters,
    sort,
    visibility,
    search,

    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    setPage,
    setView,
    setSort,
    setSearch,
    setVisibility,
    reset,
  }
}
