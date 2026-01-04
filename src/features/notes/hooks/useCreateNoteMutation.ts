import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { MutationCallbacks } from "@/lib/mutation-callbacks"

import { notesService } from "../services/notes.service"
import type { Note, NoteCreate } from "../models/note.model"
import { NOTES_QUERY_KEYS } from "./notes.keys"

type NoteCreateInput = Omit<NoteCreate, "ownerId"> & Partial<Pick<NoteCreate, "ownerId">>

export function useCreateNoteMutation(callbacks?: MutationCallbacks<Note>) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: (payload: NoteCreateInput) => {
      const ownerId = payload.ownerId ?? userId
      if (!ownerId) {
        throw new Error("Impossible de créer la note : utilisateur non authentifié.")
      }
      return notesService.create({ ...payload, ownerId })
    },
    onSuccess: (data: Note) => {
      if (!callbacks?.silent) {
        toast.success("Note créée avec succès.")
      }
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.lists() })
      queryClient.setQueryData(NOTES_QUERY_KEYS.detail(data.id), data)
      callbacks?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : "La création de la note a échoué."
        toast.error(message)
      }
      console.error("Failed to create note:", error)
      callbacks?.onError?.(error)
    },
  })
}
