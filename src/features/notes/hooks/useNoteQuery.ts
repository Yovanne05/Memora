import { useQuery } from "@tanstack/react-query"
import { notesService } from "../services/notes.service"
import type { Note } from "../models/note.model"
import { NOTES_QUERY_KEYS } from "./notes.keys"

export function useNoteQuery(noteId: string) {
  return useQuery<Note>({
    queryKey: NOTES_QUERY_KEYS.detail(noteId),
    queryFn: () => notesService.get(noteId),
    retry: 1,
    enabled: Boolean(noteId),
  })
}
