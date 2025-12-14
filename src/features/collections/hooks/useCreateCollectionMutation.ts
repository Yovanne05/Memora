import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { Collection, CollectionCreate } from '@/features/collections/models/collection.model'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

interface MutationCallbacks {
  onSuccess?: (data: Collection) => void
  onError?: (error: Error) => void
  silent?: boolean
}

export function useCreateCollectionMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CollectionCreate) => collectionsService.create(data),
    onSuccess: (newCollection) => {
      if (!callbacks?.silent) {
        toast.success('Collection créée avec succès.')
      }

      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) => [newCollection, ...(old ?? [])]
      )

      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })

      callbacks?.onSuccess?.(newCollection)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : 'La création de la collection a échoué.'
        toast.error(message)
      }
      console.error('Failed to create collection:', error)
      callbacks?.onError?.(error)
    },
  })
}
