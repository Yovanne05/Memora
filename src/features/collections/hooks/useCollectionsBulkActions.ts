import { useCallback } from "react"
import { toast } from "sonner"
import { useUpdateCollectionMutation } from "./useUpdateCollectionMutation"
import { useDeleteCollectionMutation } from "./useDeleteCollectionMutation"
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
  const updateMutation = useUpdateCollectionMutation({ silent: true })
  const deleteMutation = useDeleteCollectionMutation({ silent: true })

  const updateVisibility = useCallback(
    async (visibility: CollectionVisibility) => {
      const count = selectedIds.length
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
        toast.success(`${count} collection${count > 1 ? 's' : ''} mise${count > 1 ? 's' : ''} à jour.`)
        onSuccess?.()
      } catch (error) {
        const message = error instanceof Error ? error.message : `La mise à jour des collections a échoué.`
        toast.error(message)
        console.error(`Bulk set ${visibility} failed:`, error)
        throw error
      }
    },
    [selectedIds, collections, updateMutation, onSuccess]
  )

  const deleteSelected = useCallback(async () => {
    const count = selectedIds.length
    try {
      await Promise.all(
        selectedIds.map((id) => deleteMutation.mutateAsync(id))
      )
      toast.success(`${count} collection${count > 1 ? 's' : ''} supprimée${count > 1 ? 's' : ''} avec succès.`)
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'La suppression des collections a échoué.'
      toast.error(message)
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
