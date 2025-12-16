import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { noteLinksService } from "../services/note-links.service"
import type { NoteLink } from "../models/note-link.model"
import { NOTE_LINKS_QUERY_KEYS } from "./note-links.keys"

interface MutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
  silent?: boolean
}

export function useDeleteNoteLinkMutation(noteId: string, callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkedNoteId: string) => noteLinksService.remove(noteId, linkedNoteId),
    onSuccess: (_, linkedNoteId) => {
      if (!callbacks?.silent) {
        toast.success("Lien supprimé avec succès.")
      }

      queryClient.setQueryData(
        NOTE_LINKS_QUERY_KEYS.list(noteId),
        (old: NoteLink[] | undefined) =>
          old?.filter((link) => link.linkedNoteId !== linkedNoteId) ?? []
      )

      queryClient.invalidateQueries({
        queryKey: NOTE_LINKS_QUERY_KEYS.lists(),
      })

      queryClient.invalidateQueries({ queryKey: ["visualization"] })

      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : "La suppression du lien a échoué."
        toast.error(message)
      }
      console.error("Failed to delete note link:", error)
      callbacks?.onError?.(error)
    },
  })
}
