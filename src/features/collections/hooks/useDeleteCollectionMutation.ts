import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { Collection } from '@/features/collections/models/collection.model'
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

      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) =>
          old?.filter((c) => c.id !== id) ?? []
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
