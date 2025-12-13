import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useCurrentUser } from "@/hooks/useCurrentUser"

import { notesService } from "../services/notes.service"
import type { Note, NoteCreate } from "../models/note.model"
import { NOTES_QUERY_KEYS } from "./useNotesQuery"

type NoteCreateInput = Omit<NoteCreate, "ownerId"> & Partial<Pick<NoteCreate, "ownerId">>

export function useCreateNoteMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { userId } = useCurrentUser()

  return useMutation({
    mutationFn: (payload: NoteCreateInput) => {
      const ownerId = payload.ownerId ?? userId
      if (!ownerId) {
        throw new Error("Impossible de créer la note : utilisateur non authentifié.")
      }
      return notesService.create({ ...payload, ownerId })
    },
    onSuccess: (data: Note) => {
      toast.success("Note créée avec succès.")
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.lists() })
      queryClient.setQueryData(NOTES_QUERY_KEYS.detail(data.id), data)
      options?.onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "La création de la note a échoué."
      toast.error(message)
    },
  })
}
