import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { MutationCallbacks } from '@/lib/mutation-callbacks'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { Collection, CollectionUpdate } from '@/features/collections/models/collection.model'
import type { PaginatedCollections } from '../types/paginated-collection'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'
import { logger } from "@/lib/logger"

export function useUpdateCollectionMutation(callbacks?: MutationCallbacks<Collection>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollectionUpdate }) =>
      collectionsService.update(id, data),
    onSuccess: (updated) => {
      if (!callbacks?.silent) {
        toast.success('Collection mise à jour.')
      }

      queryClient.setQueryData<PaginatedCollections>(
        COLLECTIONS_QUERY_KEYS.list(),
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((c) => (c.id === updated.id ? updated : c)),
          }
        }
      )

      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.detail(updated.id),
        updated
      )

      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.detail(updated.id),
      })

      callbacks?.onSuccess?.(updated)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : 'La mise à jour de la collection a échoué.'
        toast.error(message)
      }
      logger.error('Failed to update collection:', error)
      callbacks?.onError?.(error)
    },
  })
}
