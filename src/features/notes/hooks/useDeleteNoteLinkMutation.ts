import { useMutation, useQueryClient } from "@tanstack/react-query"
import { noteLinksService } from "../services/note-links.service"

export function useDeleteNoteLinkMutation(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkedNoteId: string) => noteLinksService.remove(noteId, linkedNoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", noteId, "links"] })
      queryClient.invalidateQueries({
        queryKey: ["notes"],
        predicate: (query) => {
          const keys = query.queryKey as string[]
          return keys.length === 3 && keys[2] === "links"
        }
      })
      queryClient.invalidateQueries({ queryKey: ["visualization"] })
    },
  })
}
