import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { noteLinksService } from "../services/note-links.service"
import type { CreateNoteLink, NoteLink } from "../models/note-link.model"
import { NOTE_LINKS_QUERY_KEYS } from "./note-links.keys"

interface MutationCallbacks {
  onSuccess?: (data: NoteLink) => void
  onError?: (error: Error) => void
  silent?: boolean
}

export function useCreateNoteLinkMutation(noteId: string, callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateNoteLink) => noteLinksService.create(noteId, payload),
    onSuccess: (newNoteLink) => {
      if (!callbacks?.silent) {
        toast.success("Lien créé avec succès.")
      }

      queryClient.setQueryData(
        NOTE_LINKS_QUERY_KEYS.list(noteId),
        (old: NoteLink[] | undefined) => [newNoteLink, ...(old ?? [])]
      )

      queryClient.invalidateQueries({
        queryKey: NOTE_LINKS_QUERY_KEYS.lists(),
      })

      queryClient.invalidateQueries({ queryKey: ["visualization"] })

      callbacks?.onSuccess?.(newNoteLink)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : "La création du lien a échoué."
        toast.error(message)
      }
      console.error("Failed to create note link:", error)
      callbacks?.onError?.(error)
    },
  })
}
