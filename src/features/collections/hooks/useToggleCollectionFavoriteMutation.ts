import { useMutation, useQueryClient } from "@tanstack/react-query"
import { collectionsService } from "../services/collections.service"
import { COLLECTIONS_QUERY_KEYS } from "./collections.keys"

type Args = { collectionId: string; next: boolean }

export function useToggleCollectionFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ collectionId, next }: Args) => {
      if (next) {
        await collectionsService.addFavorite(collectionId)
      } else {
        await collectionsService.removeFavorite(collectionId)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEYS.all })
    },
  })
}
