import { useCallback, useState } from "react"
import type { CollectionFormValues } from "../components/forms/CollectionEditForm"
import type { Collection, CollectionUpdate } from "../models/collection.model"
import { useUpdateCollectionMutation } from "./useUpdateCollectionMutation"

export function useCollectionEdit() {
  const [target, setTarget] = useState<Collection | null>(null)

  const updateMutation = useUpdateCollectionMutation({
    onSuccess: () => setTarget(null),
  })

  const handleSubmit = useCallback(
    async (values: CollectionFormValues) => {
      if (!target) return
      const data: CollectionUpdate = {
        name: values.name,
        description: values.description,
        visibility: values.visibility,
      }

      if (values.tags !== undefined) {
        data.tags = values.tags
      }

      await updateMutation.mutateAsync({
        id: target.id,
        data,
      })
    },
    [target, updateMutation]
  )

  return {
    target,
    open: setTarget,
    close: () => setTarget(null),
    submit: handleSubmit,
    loading: updateMutation.isPending,
    error: updateMutation.error,
  }
}
