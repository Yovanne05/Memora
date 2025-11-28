import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "../api/notes.api";
import type { NotesFilters } from "../models/note-filters.model";
import type { PaginatedNotes } from "../models/note.model";

export function useNotesQuery(
    page: number,
    limit: number,
    filters: NotesFilters
) {
    return useQuery<PaginatedNotes>({
        queryKey: ["notes", page, filters],
        retry: 1,
        queryFn: () => fetchNotes({ page, limit, filters }),
        placeholderData: keepPreviousData,
    });
}
