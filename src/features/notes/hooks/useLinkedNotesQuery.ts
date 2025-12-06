import { useQueries } from "@tanstack/react-query"
import { fetchNoteById } from "../api/notes.api"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"

export function useLinkedNotesQuery(links: NoteLink[] | undefined) {
  const linkedNoteIds = links?.map(link => link.linkedNoteId) ?? []

  const queries = useQueries({
    queries: linkedNoteIds.map(noteId => ({
      queryKey: ["note", noteId],
      queryFn: () => fetchNoteById(noteId),
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }))
  })

  return {
    notes: queries.map(q => q.data).filter((note): note is Note => note !== undefined),
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
  }
}
