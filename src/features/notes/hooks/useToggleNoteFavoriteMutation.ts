import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notesService } from '../services/notes.service'

export function useAddNoteFavoriteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      await notesService.addFavorite(noteId)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['notes'] })
      await qc.invalidateQueries({ queryKey: ['note'] })
    },
  })
}

export function useRemoveNoteFavoriteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      await notesService.removeFavorite(noteId)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['notes'] })
      await qc.invalidateQueries({ queryKey: ['note'] })
    },
  })
}

export function useToggleNoteFavoriteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ noteId, next }: { noteId: string; next: boolean }) => {
      if (next) {
        await notesService.addFavorite(noteId)
      } else {
        await notesService.removeFavorite(noteId)
      }
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['notes'] })
      await qc.invalidateQueries({ queryKey: ['note'] })
    },
  })
}
