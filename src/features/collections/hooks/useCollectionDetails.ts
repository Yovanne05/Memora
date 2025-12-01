import { useCallback, useMemo, useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { useCollectionQuery, useUpdateCollectionMutation, useDeleteCollectionMutation } from "./useCollectionsQuery"
import type { CollectionFormValues } from "../components/forms/CollectionEditForm"
import type { Collection } from "../models/collection.model"

export function useCollectionDetails(id: string) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null)

  const collectionQuery = useCollectionQuery(id)
  const updateMutation = useUpdateCollectionMutation({
    onSuccess: () => setIsEditing(false),
  })
  const deleteMutation = useDeleteCollectionMutation({
    onSuccess: () => {
      setDeleteTarget(null)
      router.navigate({ to: "/app/collections" })
    },
  })

  const handleEdit = useCallback(
    async (values: CollectionFormValues) => {
      if (!collectionQuery.data || updateMutation.isPending) return

      await updateMutation.mutateAsync({
        id: collectionQuery.data.id,
        data: {
          name: values.name,
          description: values.description,
          visibility: values.visibility,
        },
      })
    },
    [collectionQuery.data, updateMutation]
  )

  const handleBack = useCallback(() => {
    router.navigate({ to: "/app/collections" })
  }, [router])

  const handleDelete = useCallback(() => {
    if (collectionQuery.data) {
      setDeleteTarget(collectionQuery.data)
    }
  }, [collectionQuery.data])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
  }, [deleteTarget, deleteMutation])

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null)
    deleteMutation.reset()
  }, [deleteMutation])

  const initialValues = useMemo(
    () => ({
      name: collectionQuery.data?.name ?? "",
      description: collectionQuery.data?.description ?? "",
      visibility: collectionQuery.data?.visibility ?? "private",
    }),
    [collectionQuery.data]
  )

  return {
    collection: collectionQuery.data ?? null,
    loading: collectionQuery.isPending,
    error: collectionQuery.error?.message ?? null,
    reload: collectionQuery.refetch,
    isEditing,
    setIsEditing,
    updateHook: {
      loading: updateMutation.isPending,
    },
    deletion: {
      target: deleteTarget,
      loading: deleteMutation.isPending,
      error: deleteMutation.error?.message ?? null,
      reset: handleCancelDelete,
      confirmDelete: handleConfirmDelete,
    },
    initialValues,
    handlers: {
      onEdit: handleEdit,
      onBack: handleBack,
      onDelete: handleDelete,
    },
  }
}
