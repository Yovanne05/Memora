import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getContextualErrorMessage } from '@/lib/error-context'

import type { SharePermission } from '@/features/notes/dtos/note-share.dto'
import type { User } from '@/features/users/models/user.model'
import type { Share } from './types'

type UseShareDialogStateArgs = {
  shares: Share[]
  currentUserId: string
  onAddShare: (userId: string, permission: SharePermission) => Promise<void>
  onUpdateShare: (userId: string, permission: SharePermission) => Promise<void>
  onRemoveShare: (userId: string) => Promise<void>
}

export function useShareDialogState({
  shares,
  currentUserId,
  onAddShare,
  onUpdateShare,
  onRemoveShare,
}: UseShareDialogStateArgs) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [permission, setPermission] = useState<SharePermission>('read')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const excludedUserIds = useMemo(
    () => [currentUserId, ...shares.map((share) => share.userId)],
    [currentUserId, shares]
  )

  const handleAddShare = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      await onAddShare(selectedUser.id, permission)
      setSelectedUser(null)
      setPermission('read')
      toast.success('Utilisateur ajouté avec succès')
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'create',
        resource: 'note',
        fallback: "Échec de l'ajout de l'utilisateur",
      })
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePermission = async (
    userId: string,
    newPermission: SharePermission
  ) => {
    try {
      await onUpdateShare(userId, newPermission)
      toast.success('Permission mise à jour')
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'update',
        resource: 'note',
        fallback: 'Échec de la mise à jour de la permission',
      })
      toast.error(message)
    }
  }

  const handleRemoveShare = async (userId: string) => {
    try {
      await onRemoveShare(userId)
      toast.success('Utilisateur retiré')
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'delete',
        resource: 'note',
        fallback: "Échec du retrait de l'utilisateur",
      })
      toast.error(message)
    }
  }

  return {
    selectedUser,
    permission,
    isSubmitting,
    excludedUserIds,
    setSelectedUser,
    setPermission,
    handleAddShare,
    handleUpdatePermission,
    handleRemoveShare,
  }
}
