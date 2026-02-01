import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionSharesService } from '../services/collection-shares.service'
import { collectionSharesKeys } from './collection-shares.keys'
import type { CollectionShareCreate } from '../models/collection-share.model'

export function useCreateCollectionShareMutation(collectionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CollectionShareCreate) =>
      collectionSharesService.create(collectionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: collectionSharesKeys.list(collectionId),
      })
    },
  })
}
