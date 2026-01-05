import { useAuth } from "@/features/auth/hooks/useAuth"
import type { MutationCallbacks } from "@/lib/mutation-callbacks"
import { useCreateMutation } from "@/lib/hooks/useResourceMutation"

import { notesService } from "../services/notes.service"
import type { Note, NoteCreate } from "../models/note.model"
import { NOTES_QUERY_KEYS } from "./notes.keys"

type NoteCreateInput = Omit<NoteCreate, "ownerId"> & Partial<Pick<NoteCreate, "ownerId">>

export function useCreateNoteMutation(callbacks?: MutationCallbacks<Note>) {
  const { user } = useAuth()
  const userId = user?.id

  return useCreateMutation<Note, NoteCreateInput>(
    {
      mutationFn: (payload: NoteCreateInput) => {
        const ownerId = payload.ownerId ?? userId
        if (!ownerId) {
          throw new Error("Impossible de créer la note : utilisateur non authentifié.")
        }
        return notesService.create({ ...payload, ownerId })
      },
      listQueryKey: NOTES_QUERY_KEYS.lists(),
      detailQueryKey: (data: Note) => NOTES_QUERY_KEYS.detail(data.id),
      successMessage: "Note créée avec succès.",
      errorMessage: "La création de la note a échoué.",
    },
    callbacks
  )
}
