import { useCallback, useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { CollectionFormValues } from "../components/CollectionEditForm"
import type { CollectionCreate } from "../models/collection.model"
import { useCreateCollectionMutation } from "./useCreateCollectionMutation"

export function useCollectionCreate() {
  const { user } = useAuth()
  const userId = user?.id
  const [isOpen, setIsOpen] = useState(false)

  const createMutation = useCreateCollectionMutation({
    onSuccess: () => setIsOpen(false),
  })

  const handleSubmit = useCallback(
    async (values: CollectionFormValues) => {
      if (!userId) return

      const payload: CollectionCreate = {
        ownerId: userId,
        name: values.name,
        description: values.description ?? undefined,
        visibility: values.visibility,
      }

      if (values.tags !== undefined) {
        payload.tags = values.tags
      }

      await createMutation.mutateAsync(payload)
    },
    [userId, createMutation]
  )

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    submit: handleSubmit,
    loading: createMutation.isPending,
    error: createMutation.error,
  }
}
