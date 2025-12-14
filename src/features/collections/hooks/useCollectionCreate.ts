import { useCallback, useState } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useCreateCollectionMutation } from "./useCreateCollectionMutation"
import type { CollectionFormValues } from "../components/forms/CollectionEditForm"

export function useCollectionCreate() {
  const { userId } = useCurrentUser()
  const [isOpen, setIsOpen] = useState(false)

  const createMutation = useCreateCollectionMutation({
    onSuccess: () => setIsOpen(false),
  })

  const handleSubmit = useCallback(
    async (values: CollectionFormValues) => {
      if (!userId) return
      await createMutation.mutateAsync({
        ownerId: userId,
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        tags: values.tags,
      })
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
