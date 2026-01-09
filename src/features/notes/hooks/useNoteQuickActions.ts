import { useState } from "react"
import { toast } from "sonner"

import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"
import { useCreateNoteMutation } from "./useCreateNoteMutation"
import { useDeleteNoteMutation } from "./useDeleteNoteMutation"
import { useUpdateNoteMutation } from "./useUpdateNoteMutation"
import type { Note } from "../models/note.model"

type UseNoteQuickActionsArgs = {
  note: Note
  onActionComplete?: () => void
}

export function useNoteQuickActions({
  note,
  onActionComplete,
}: UseNoteQuickActionsArgs) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const updateMutation = useUpdateNoteMutation({ onSuccess: onActionComplete })
  const deleteMutation = useDeleteNoteMutation({ onSuccess: onActionComplete })
  const duplicateMutation = useCreateNoteMutation({ onSuccess: onActionComplete })
  const { data: collectionsData } = useCollectionsQuery()
  const collections = collectionsData?.items ?? []

  const handleToggleVisibility = async () => {
    const newVisibility = note.visibility === "private" ? "public" : "private"
    await updateMutation.mutateAsync({
      noteId: note.id,
      payload: { visibility: newVisibility },
    })
    setIsDropdownOpen(false)
  }

  const handleMoveToCollection = async (collectionId: string | null) => {
    await updateMutation.mutateAsync({
      noteId: note.id,
      payload: { collectionId },
    })
    setIsDropdownOpen(false)
  }

  const handleDuplicate = async () => {
    await duplicateMutation.mutateAsync({
      ownerId: note.ownerId,
      title: `${note.title} (copie)`,
      content: "",
      collectionId: note.collectionId,
      visibility: note.visibility,
      tags: note.tags,
    })
    toast.success("Note dupliquée")
    setIsDropdownOpen(false)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(note.id)
    setDeleteDialogOpen(false)
  }

  const isPending =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    duplicateMutation.isPending

  return {
    collections,
    isPending,
    deleteDialogOpen,
    setDeleteDialogOpen,
    shareDialogOpen,
    setShareDialogOpen,
    isDropdownOpen,
    setIsDropdownOpen,
    handleToggleVisibility,
    handleMoveToCollection,
    handleDuplicate,
    handleDelete,
  }
}

