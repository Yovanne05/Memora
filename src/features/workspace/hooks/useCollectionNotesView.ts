import { useEffect, useMemo, useState } from "react"

import { useCollectionQuery } from "@/features/collections/hooks/useCollectionQuery"
import { useUpdateCollectionMutation } from "@/features/collections/hooks/useUpdateCollectionMutation"
import { useWorkspaceNotes } from "./useWorkspaceNotes"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import type { CollectionFormValues } from "@/features/collections/types/collection-form.types"

export function useCollectionNotesView(collectionId: string) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const collectionQuery = useCollectionQuery(collectionId)
  const { notes, total, limit, isLoading, isError, error } = useWorkspaceNotes({
    collectionId,
  })
  const { state, actions } = useWorkspaceContext()
  const updateCollectionMutation = useUpdateCollectionMutation()

  useEffect(() => {
    actions.selectCollection(collectionId)
  }, [collectionId, actions])

  const maxPage = useMemo(() => {
    return Math.max(0, Math.ceil(total / limit) - 1)
  }, [total, limit])

  const handleUpdateCollection = async (values: CollectionFormValues) => {
    await updateCollectionMutation.mutateAsync({
      id: collectionId,
      data: {
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        tags: values.tags,
      },
    })
    setEditDialogOpen(false)
  }

  return {
    collectionQuery,
    notes,
    total,
    limit,
    isLoading,
    isError,
    error,
    state,
    actions,
    editDialogOpen,
    setEditDialogOpen,
    updateCollectionMutation,
    maxPage,
    handleUpdateCollection,
  }
}

