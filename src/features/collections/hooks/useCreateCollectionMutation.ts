import type { MutationCallbacks } from '@/lib/mutation-callbacks'
import { useCreateMutation } from '@/hooks/useResourceMutation'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { Collection, CollectionCreate } from '@/features/collections/models/collection.model'
import type { PaginatedCollections } from '../types/paginated-collection'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

export function useCreateCollectionMutation(callbacks?: MutationCallbacks<Collection>) {
  return useCreateMutation<Collection, CollectionCreate, PaginatedCollections>(
    {
      mutationFn: (data: CollectionCreate) => collectionsService.create(data),
      listQueryKey: COLLECTIONS_QUERY_KEYS.lists(),
      detailQueryKey: (data: Collection) => COLLECTIONS_QUERY_KEYS.detail(data.id),
      successMessage: 'Collection créée avec succès.',
      errorMessage: 'La création de la collection a échoué.',
      optimisticUpdate: (old: PaginatedCollections | undefined, newCollection: Collection) => {
        if (!old) {
          return {
            items: [newCollection],
            total: 1,
            offset: 0,
            limit: 10,
          }
        }
        return {
          ...old,
          items: [newCollection, ...old.items],
          total: old.total + 1,
        }
      },
    },
    callbacks
  )
}
