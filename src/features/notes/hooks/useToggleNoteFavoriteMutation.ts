import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notesService } from "../services/notes.service"

type Args = { noteId: string; next: boolean }

export function useToggleNoteFavoriteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ noteId, next }: Args) => {
      if (next) await notesService.addFavorite(noteId)
      else await notesService.removeFavorite(noteId)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] })
      await qc.invalidateQueries({ queryKey: ["note"] })
    },
  })
}
