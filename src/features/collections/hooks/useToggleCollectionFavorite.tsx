import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsService } from '../services/collections.service'

export function useAddCollectionFavoriteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (collectionId: string) => {
      await collectionsService.addFavorite(collectionId)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['collections'] })
      await qc.invalidateQueries({ queryKey: ['collection'] })
    },
  })
}

export function useRemoveCollectionFavoriteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (collectionId: string) => {
      await collectionsService.removeFavorite(collectionId)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['collections'] })
      await qc.invalidateQueries({ queryKey: ['collection'] })
    },
  })
}
