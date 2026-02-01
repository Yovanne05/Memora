import { useQuery } from "@tanstack/react-query"
import { noteLinksService } from "../services/note-links.service"
import { NOTE_LINKS_QUERY_KEYS } from "./note-links.keys"

export function useNoteLinksQuery(noteId: string | undefined) {
  return useQuery({
    queryKey: noteId ? NOTE_LINKS_QUERY_KEYS.list(noteId) : NOTE_LINKS_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await noteLinksService.list({ noteId: noteId! })
      return response.items
    },
    enabled: Boolean(noteId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: 1,
  })
}
