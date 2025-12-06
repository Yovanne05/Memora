import { useCallback, useState } from "react"
import type { Collection } from "../models/collection.model"
import { useDeleteCollectionMutation } from "./useCollectionsQuery"

export function useCollectionDelete() {
  const [target, setTarget] = useState<Collection | null>(null)

  const deleteMutation = useDeleteCollectionMutation({
    onSuccess: () => setTarget(null),
  })

  const handleConfirm = useCallback(async () => {
    if (!target) return
    await deleteMutation.mutateAsync(target.id)
  }, [target, deleteMutation])

  return {
    target,
    open: setTarget,
    close: () => {
      setTarget(null)
      deleteMutation.reset()
    },
    confirm: handleConfirm,
    loading: deleteMutation.isPending,
    error: deleteMutation.error,
  }
}
