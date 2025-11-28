import { useState, useCallback } from "react"
import type { Collection } from "../models/collection.model"
import { deleteCollection } from "../api/collections.api"

interface UseCollectionDeletionArgs {
  onDeleted?: (id: string) => void
}

export function useCollectionDeletion({ onDeleted }: UseCollectionDeletionArgs = {}) {
  const [target, setTarget] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmDelete = useCallback(async () => {
    if (!target) return

    try {
      setLoading(true)
      setError(null)
      await deleteCollection(target.id)
      onDeleted?.(target.id)
      setTarget(null)
    } catch (err) {
      console.error(err)
      setError("Unable to delete this collection. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [onDeleted, target])

  const reset = useCallback(() => {
    setTarget(null)
    setError(null)
  }, [])

  return {
    target,
    setTarget,
    loading,
    error,
    confirmDelete,
    reset,
  }
}
