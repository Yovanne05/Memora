import type { Collection, CollectionCreate } from "../models/collection.model"
import {
  collectionsService,
  type CollectionsService,
} from "../services/collections.service"
import { useAsyncMutation } from "@/hooks/useAsyncMutation"

export function useCreateCollection(
  onSuccess?: (created: Collection) => void,
  service: CollectionsService = collectionsService
) {
  const { execute, loading, error, resetError } = useAsyncMutation<
    [CollectionCreate],
    Collection
  >(
    (payload) => service.create(payload),
    "Unable to create the collection.",
    (created) => onSuccess?.(created)
  )

  return {
    create: execute,
    loading,
    error,
    resetError,
  }
}
