import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { notesService } from "../services/notes.service"
import type { NotesFilters } from "../types/note-query"
import type { PaginatedNotes } from "../types/paginated-note"

export const NOTES_QUERY_KEYS = {
  all: ["notes"] as const,
  lists: () => [...NOTES_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...NOTES_QUERY_KEYS.lists(), filters] as const,
  details: () => [...NOTES_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...NOTES_QUERY_KEYS.details(), id] as const,
}

export function useNotesQuery(page: number, limit: number, filters: NotesFilters = {}) {
  return useQuery<PaginatedNotes>({
    queryKey: NOTES_QUERY_KEYS.list({ page, limit, filters }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: () => notesService.list({ ...filters, limit, offset: page * limit }),
    placeholderData: keepPreviousData,
  })
}
