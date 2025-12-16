import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { PaginatedCollections } from '../types/paginated-collection'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

interface MutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
  silent?: boolean
}

export function useDeleteCollectionMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => collectionsService.remove(id),
    onSuccess: (_, id) => {
      if (!callbacks?.silent) {
        toast.success('Collection supprimée avec succès.')
      }

      queryClient.setQueryData<PaginatedCollections>(
        COLLECTIONS_QUERY_KEYS.list(),
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.filter((c) => c.id !== id),
            total: old.total - 1,
          }
        }
      )

      queryClient.removeQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })

      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : 'La suppression de la collection a échoué.'
        toast.error(message)
      }
      console.error('Failed to delete collection:', error)
      callbacks?.onError?.(error)
    },
  })
}
