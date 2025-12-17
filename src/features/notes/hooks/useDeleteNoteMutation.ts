import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { notesService } from "../services/notes.service"
import { NOTES_QUERY_KEYS } from "./useNotesQuery"

export function useDeleteNoteMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => notesService.remove(noteId),
    onSuccess: (_, noteId) => {
      toast.success("Note supprimée avec succès.")
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.lists() })
      queryClient.removeQueries({ queryKey: NOTES_QUERY_KEYS.detail(noteId) })
      options?.onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "La suppression de la note a échoué."
      toast.error(message)
    },
  })
}
