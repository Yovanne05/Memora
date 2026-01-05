import { useMutation, useQueryClient } from "@tanstack/react-query"
import { collectionsService } from "../services/collections.service"

type Args = {
  collectionId: string
  next: boolean
}

export function useToggleCollectionFavoriteMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ collectionId, next }: Args) => {
      if (next) await collectionsService.addFavorite(collectionId)
      else await collectionsService.removeFavorite(collectionId)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["collections"] })
      await qc.invalidateQueries({ queryKey: ["collection"] })
    },
  })
}
