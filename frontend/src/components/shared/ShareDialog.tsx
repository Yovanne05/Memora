import { Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { ShareDialogBody } from './share-dialog/ShareDialogBody'
import type { ShareDialogProps } from './share-dialog/types'
import { useShareDialogState } from './share-dialog/useShareDialogState'
import { useUsersByIds } from '@/features/users/hooks/useUsersByIds'

export type { Share, ShareDialogProps } from './share-dialog/types'

export function ShareDialog({
  title,
  description,
  shares,
  currentUserId,
  onAddShare,
  onUpdateShare,
  onRemoveShare,
  isLoading,
  open,
  onOpenChange,
  trigger,
}: Readonly<ShareDialogProps>) {
  const {
    selectedUser,
    permission,
    isSubmitting,
    excludedUserIds,
    setSelectedUser,
    setPermission,
    handleAddShare,
    handleUpdatePermission,
    handleRemoveShare,
  } = useShareDialogState({
    shares,
    currentUserId,
    onAddShare,
    onUpdateShare,
    onRemoveShare,
  })

  const missingUserIds = shares
    .filter((share) => !share.user)
    .map((share) => share.userId)
  const { usersById } = useUsersByIds(missingUserIds)
  const sharesWithUsers = shares.map((share) => {
    const user = share.user ?? usersById.get(share.userId)
    const userLabel = user?.username ?? share.userId
    return { ...share, userLabel }
  })

  const busy = isLoading || isSubmitting

  const body = (
    <ShareDialogBody
      title={title}
      description={description}
      shares={sharesWithUsers}
      selectedUser={selectedUser}
      permission={permission}
      excludedUserIds={excludedUserIds}
      isLoading={busy}
      onUserChange={setSelectedUser}
      onPermissionChange={setPermission}
      onSubmit={handleAddShare}
      onUpdatePermission={handleUpdatePermission}
      onRemove={handleRemoveShare}
      contentProps={
        trigger === undefined
          ? {
              onPointerDownOutside: (event) => event.preventDefault(),
              onClick: (event) => event.stopPropagation(),
              onMouseDown: (event) => event.stopPropagation(),
              onPointerDown: (event) => event.stopPropagation(),
            }
          : undefined
      }
    />
  )

  if (trigger !== undefined) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
        </DialogTrigger>
        {body}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      {body}
    </Dialog>
  )
}
