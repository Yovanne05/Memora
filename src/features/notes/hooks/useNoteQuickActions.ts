import { useState } from 'react'
import { toast } from 'sonner'

import { useCollectionsQuery } from '@/features/collections/hooks/useCollectionsQuery'
import { filterManageableCollections } from '@/features/collections/lib/collection-permissions'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCreateNoteMutation } from './useCreateNoteMutation'
import { useDeleteNoteMutation } from './useDeleteNoteMutation'
import { useUpdateNoteMutation } from './useUpdateNoteMutation'
import type { Note } from '../models/note.model'

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
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { user } = useAuth()
  const updateMutation = useUpdateNoteMutation({ onSuccess: onActionComplete })
  const deleteMutation = useDeleteNoteMutation({ onSuccess: onActionComplete })
  const duplicateMutation = useCreateNoteMutation({
    onSuccess: onActionComplete,
  })
  const { data: collectionsData } = useCollectionsQuery()
  const userId = user?.id
  const isOwner = Boolean(userId && note.ownerId === userId)
  const canWrite =
    note.userPermission === 'write' ||
    note.userPermission === 'owner' ||
    isOwner
  const canManage = note.userPermission === 'owner' || isOwner
  const canMove = isOwner
  const canToggleVisibility = canWrite
  const canShare = canManage
  const canDelete = canManage
  const canDuplicate = isOwner
  const collections = filterManageableCollections(
    collectionsData?.items ?? [],
    user
  )
  const moveCollections = canMove ? collections : []

  const handleToggleVisibility = async () => {
    const newVisibility = note.visibility === 'private' ? 'public' : 'private'
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
      content: '',
      collectionId: note.collectionId,
      visibility: note.visibility,
      tags: note.tags,
    })
    toast.success('Note dupliquée')
    setIsDropdownOpen(false)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: note.id })
    setDeleteDialogOpen(false)
  }

  const isPending =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    duplicateMutation.isPending

  return {
    collections: moveCollections,
    canMove,
    canToggleVisibility,
    canShare,
    canDuplicate,
    canDelete,
    isPending,
    deleteDialogOpen,
    setDeleteDialogOpen,
    shareDialogOpen,
    setShareDialogOpen,
    reportDialogOpen,
    setReportDialogOpen,
    isDropdownOpen,
    setIsDropdownOpen,
    handleToggleVisibility,
    handleMoveToCollection,
    handleDuplicate,
    handleDelete,
  }
}
