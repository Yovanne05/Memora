import type { Collection, CollectionUpdate } from "../models/collection.model"
import {
  collectionsService,
  type CollectionsService,
} from "../services/collections.service"
import { useAsyncMutation } from "@/hooks/useAsyncMutation"

export function useUpdateCollection(
  onSuccess?: (updated: Collection) => void,
  service: CollectionsService = collectionsService
) {
  const { execute, loading, error, resetError } = useAsyncMutation<
    [string, CollectionUpdate],
    Collection
  >(
    (id, payload) => service.update(id, payload),
    "Unable to update the collection.",
    (updated) => onSuccess?.(updated)
  )

  return {
    update: execute,
    loading,
    error,
    resetError,
  }
}
