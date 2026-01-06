import { useCallback, useMemo, useState } from "react"
import { useRouter } from "@tanstack/react-router"
import type { CollectionFormValues } from "../components/CollectionEditForm"
import type { Collection, CollectionUpdate } from "../models/collection.model"
import { useCollectionQuery } from "./useCollectionQuery"
import { useDeleteCollectionMutation } from "./useDeleteCollectionMutation"
import { useUpdateCollectionMutation } from "./useUpdateCollectionMutation"

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
      router.navigate({ to: "/app/workspace" })
    },
  })

  const handleEdit = useCallback(
    async (values: CollectionFormValues) => {
      if (!collectionQuery.data || updateMutation.isPending) return

      const data: CollectionUpdate = {
        name: values.name,
        description: values.description,
        visibility: values.visibility,
      }

      if (values.tags !== undefined) {
        data.tags = values.tags
      }

      await updateMutation.mutateAsync({
        id: collectionQuery.data.id,
        data,
      })
    },
    [collectionQuery.data, updateMutation]
  )

  const handleBack = useCallback(() => {
    router.navigate({ to: "/app/workspace" })
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

  const initialValues = useMemo(() => {
    const base = {
      name: collectionQuery.data?.name ?? "",
      description: collectionQuery.data?.description ?? "",
      visibility: collectionQuery.data?.visibility ?? "private",
    }

    if (collectionQuery.data?.tags && collectionQuery.data.tags.length > 0) {
      return { ...base, tags: collectionQuery.data.tags }
    }

    return base
  }, [collectionQuery.data])

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
