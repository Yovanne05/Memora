import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { notesService } from "../services/notes.service"
import type { NotesFilters } from "../types/note-query"
import type { PaginatedNotes } from "../types/paginated-note"
import { NOTES_QUERY_KEYS } from "./notes.keys"

export function useNotesQuery(page: number, limit: number, filters: NotesFilters = {}) {
  return useQuery<PaginatedNotes>({
    queryKey: NOTES_QUERY_KEYS.list({ page, limit, filters }),
    retry: 1,
    queryFn: () => notesService.list({ ...filters, limit, offset: page * limit }),
    placeholderData: keepPreviousData,
  })
}
