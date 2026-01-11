import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsService } from '../services/collections.service'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

export function useAddCollectionFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (collectionId: string) => {
      await collectionsService.addFavorite(collectionId)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })
      await queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.all,
      })
    },
  })
}

export function useRemoveCollectionFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (collectionId: string) => {
      await collectionsService.removeFavorite(collectionId)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })
      await queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.all,
      })
    },
  })
}
