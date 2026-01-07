import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { MutationCallbacks } from "@/lib/mutation-callbacks"

import { notesService } from "../services/notes.service"
import { NOTES_QUERY_KEYS } from "./notes.keys"
import { logger } from "@/lib/logger"

export function useDeleteNoteMutation(callbacks?: MutationCallbacks<void>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => notesService.remove(noteId),
    onSuccess: (_, noteId) => {
      if (!callbacks?.silent) {
        toast.success("Note supprimée avec succès.")
      }
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.lists() })
      queryClient.removeQueries({ queryKey: NOTES_QUERY_KEYS.detail(noteId) })
      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : "La suppression de la note a échoué."
        toast.error(message)
      }
      logger.error("Failed to delete note:", error)
      callbacks?.onError?.(error)
    },
  })
}
