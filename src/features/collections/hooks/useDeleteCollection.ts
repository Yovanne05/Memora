import {
  collectionsService,
  type CollectionsService,
} from "../services/collections.service"
import { useAsyncMutation } from "@/hooks/useAsyncMutation"

export function useDeleteCollection(
  onSuccess?: (id: string) => void,
  service: CollectionsService = collectionsService
) {
  const { execute, loading, error, resetError } = useAsyncMutation<[string], void>(
    (id) => service.remove(id),
    "Unable to delete the collection.",
    (_, [id]) => onSuccess?.(id)
  )

  return {
    remove: execute,
    loading,
    error,
    resetError,
  }
}
