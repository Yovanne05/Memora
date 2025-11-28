import { useState, useCallback } from "react"
import type { Collection } from "../models/collection.model"
import {
  collectionsService,
  type CollectionsService,
} from "../services/collections.service"
import { useDeleteCollection } from "./useDeleteCollection"

interface UseCollectionDeletionArgs {
  onDeleted?: (id: string) => void
  service?: CollectionsService
}

export function useCollectionDeletion({
  onDeleted,
  service = collectionsService,
}: UseCollectionDeletionArgs = {}) {
  const [target, setTarget] = useState<Collection | null>(null)
  const { remove, loading, error, resetError } = useDeleteCollection(onDeleted, service)

  const confirmDelete = useCallback(async () => {
    if (!target) return
    await remove(target.id)
    setTarget(null)
  }, [remove, target])

  const reset = useCallback(() => {
    setTarget(null)
    resetError()
  }, [resetError])

  return {
    target,
    setTarget,
    loading,
    error,
    confirmDelete,
    reset,
  }
}
