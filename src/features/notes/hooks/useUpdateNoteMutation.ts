import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { MutationCallbacks } from "@/lib/mutation-callbacks"

import { notesService } from "../services/notes.service"
import type { Note, NoteUpdate } from "../models/note.model"
import { NOTES_QUERY_KEYS } from "./notes.keys"

export function useUpdateNoteMutation(callbacks?: MutationCallbacks<Note>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: NoteUpdate }) =>
      notesService.update(noteId, payload),
    onSuccess: (data: Note) => {
      if (!callbacks?.silent) {
        toast.success("Note mise à jour.")
      }
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.lists() })
      queryClient.setQueryData(NOTES_QUERY_KEYS.detail(data.id), data)
      callbacks?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : "La mise à jour de la note a échoué."
        toast.error(message)
      }
      console.error("Failed to update note:", error)
      callbacks?.onError?.(error)
    },
  })
}
