import { useCallback, useState } from "react"
import type { Collection } from "../models/collection.model"
import { useUpdateCollectionMutation } from "./useUpdateCollectionMutation"
import type { CollectionFormValues } from "../components/forms/CollectionEditForm"

export function useCollectionEdit() {
  const [target, setTarget] = useState<Collection | null>(null)

  const updateMutation = useUpdateCollectionMutation({
    onSuccess: () => setTarget(null),
  })

  const handleSubmit = useCallback(
    async (values: CollectionFormValues) => {
      if (!target) return
      await updateMutation.mutateAsync({
        id: target.id,
        data: {
          name: values.name,
          description: values.description,
          visibility: values.visibility,
          tags: values.tags,
        },
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
