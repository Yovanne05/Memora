import { useCallback, useMemo, useState } from "react"
import { useRouter } from "@tanstack/react-router"
import type { CollectionFormValues } from "../components/CollectionEditForm"
import { useCollection } from "./useCollection"
import { useUpdateCollection } from "./useUpdateCollection"
import { useCollectionDeletion } from "./useCollectionDeletion"

export function useCollectionDetails(id: string) {
  const router = useRouter()
  const { collection, loading, error, reload } = useCollection(id)
  const [isEditing, setIsEditing] = useState(false)

  const updateHook = useUpdateCollection(() => setIsEditing(false))
  const deletion = useCollectionDeletion({
    onDeleted: () => router.navigate({ to: "/app/collections" }),
  })

  const handleEdit = useCallback(
    async (values: CollectionFormValues) => {
      if (!collection || updateHook.loading) return
      try {
        await updateHook.update(collection.id, {
          name: values.name,
          description: values.description,
          visibility: values.visibility,
        })
        await reload()
      } catch (err) {
        console.error("Failed to update collection", err)
      }
    },
    [collection, reload, updateHook]
  )

  const handleBack = useCallback(() => {
    router.navigate({ to: "/app/collections" })
  }, [router])

  const handleDelete = useCallback(() => {
    if (collection) {
      deletion.setTarget(collection)
    }
  }, [collection, deletion])

  const initialValues = useMemo(
    () => ({
      name: collection?.name ?? "",
      description: collection?.description ?? "",
      visibility: collection?.visibility ?? "private",
    }),
    [collection]
  )

  return {
    collection,
    loading,
    error,
    reload,
    isEditing,
    setIsEditing,
    updateHook,
    deletion,
    initialValues,
    handlers: {
      onEdit: handleEdit,
      onBack: handleBack,
      onDelete: handleDelete,
    },
  }
}
