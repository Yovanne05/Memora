import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { notesService } from "../services/notes.service"
import type { Note, NoteUpdate } from "../models/note.model"
import { NOTES_QUERY_KEYS } from "./useNotesQuery"

export function useUpdateNoteMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: NoteUpdate }) =>
      notesService.update(noteId, payload),
    onSuccess: (data: Note) => {
      toast.success("Note mise a jour")
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.lists() })
      queryClient.setQueryData(NOTES_QUERY_KEYS.detail(data.id), data)
      options?.onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Impossible de mettre a jour la note"
      toast.error(message)
    },
  })
}
