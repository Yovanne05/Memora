import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'

import { useNoteQuery } from '@/features/notes/hooks/useNoteQuery'
import { useUpdateNoteMutation } from '@/features/notes/hooks/useUpdateNoteMutation'
import { useDeleteNoteMutation } from '@/features/notes/hooks/useDeleteNoteMutation'
import { useWorkspaceContext } from '../context'
import { useWorkspaceNavigation } from './useWorkspaceNavigation'
import type { NoteFormValues } from '@/features/notes/types/note-edit-form.types'
import { logger } from '@/lib/logger'
import { useAuth } from '@/features/auth/hooks/useAuth'

type UseNoteEditViewArgs = {
  noteId: string
  collectionId?: string
}

export function useNoteEditView({ noteId, collectionId }: UseNoteEditViewArgs) {
  const router = useRouter()
  const { actions } = useWorkspaceContext()
  const { navigateToCollection, navigateToAllNotes } = useWorkspaceNavigation()
  const { user } = useAuth()

  const noteQuery = useNoteQuery(noteId)
  const updateMutation = useUpdateNoteMutation()
  const deleteMutation = useDeleteNoteMutation()

  useEffect(() => {
    actions.selectNote(noteId)
    if (collectionId) {
      actions.selectCollection(collectionId)
    }
  }, [noteId, collectionId, actions])

  const handleSubmit = async (values: NoteFormValues) => {
    try {
      await updateMutation.mutateAsync({
        noteId,
        payload: {
          title: values.title,
          content: values.content,
          visibility: values.visibility,
          collectionId: values.collectionId,
          tags: values.tags,
        },
      })
    } catch (error) {
      logger.error('Failed to update note:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(noteId)
      if (collectionId) {
        navigateToCollection(collectionId)
      } else {
        navigateToAllNotes()
      }
    } catch (error) {
      logger.error('Failed to delete note:', error)
    }
  }

  const handleCancel = () => {
    router.history.back()
  }

  const note = noteQuery.data ?? null
  const isOwner = Boolean(user && note && note.ownerId === user.id)
  const isReadOnly = note?.userPermission === 'read' && !isOwner
  const canDelete =
    note?.userPermission === 'owner' ||
    isOwner ||
    user?.role === 'admin' ||
    user?.role === 'super_admin'

  return {
    noteQuery,
    updateMutation,
    deleteMutation,
    note,
    isReadOnly,
    canDelete,
    handleSubmit,
    handleDelete,
    handleCancel,
  }
}
