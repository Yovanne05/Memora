import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsService } from '../services/collections.service'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (collectionId: string) =>
      collectionsService.remove(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.all,
      })
    },
  })
}
