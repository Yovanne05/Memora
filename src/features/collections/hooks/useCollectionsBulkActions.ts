import { useCallback } from "react"
import { useUpdateCollectionMutation, useDeleteCollectionMutation } from "./useCollectionsQuery"
import type { Collection, CollectionVisibility } from "../models/collection.model"

interface UseCollectionsBulkActionsProps {
  selectedIds: string[]
  collections: Collection[]
  onSuccess?: () => void
}

export function useCollectionsBulkActions({
  selectedIds,
  collections,
  onSuccess,
}: UseCollectionsBulkActionsProps) {
  const updateMutation = useUpdateCollectionMutation()
  const deleteMutation = useDeleteCollectionMutation()

  const updateVisibility = useCallback(
    async (visibility: CollectionVisibility) => {
      try {
        await Promise.all(
          selectedIds.map((id) => {
            const collection = collections.find((c) => c.id === id)
            if (!collection) return Promise.resolve()

            return updateMutation.mutateAsync({
              id: collection.id,
              data: { ...collection, visibility },
            })
          })
        )
        onSuccess?.()
      } catch (error) {
        console.error(`Bulk set ${visibility} failed:`, error)
        throw error
      }
    },
    [selectedIds, collections, updateMutation, onSuccess]
  )

  const deleteSelected = useCallback(async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => deleteMutation.mutateAsync(id))
      )
      onSuccess?.()
    } catch (error) {
      console.error("Bulk delete failed:", error)
      throw error
    }
  }, [selectedIds, deleteMutation, onSuccess])

  const setPrivate = useCallback(() => updateVisibility("private"), [updateVisibility])
  const setPublic = useCallback(() => updateVisibility("public"), [updateVisibility])

  return {
    setPrivate,
    setPublic,
    deleteSelected,
    isLoading: updateMutation.isPending || deleteMutation.isPending,
  }
}
