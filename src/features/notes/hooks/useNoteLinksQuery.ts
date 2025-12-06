import { useQuery } from "@tanstack/react-query"
import { noteLinksService } from "../services/note-links.service"

export function useNoteLinksQuery(noteId: string | undefined) {
  return useQuery({
    queryKey: ["notes", noteId, "links"],
    queryFn: () => noteLinksService.list(noteId!),
    enabled: Boolean(noteId),
    retry: 1,
  })
}
