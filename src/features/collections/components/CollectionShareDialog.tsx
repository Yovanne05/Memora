import { ShareDialog } from '@/components/shared/ShareDialog'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCollectionSharing } from '../hooks/useCollectionSharing'

interface CollectionShareDialogProps {
  collectionId: string
  collectionName: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CollectionShareDialog({
  collectionId,
  collectionName,
  open,
  onOpenChange,
  trigger,
}: Readonly<CollectionShareDialogProps>) {
  const { user } = useAuth()
  const { shares, isLoading, addShare, updateShare, removeShare } =
    useCollectionSharing(collectionId)

  if (!user) return null

  return (
    <ShareDialog
      title={`Share "${collectionName}"`}
      description="Share this collection with other users"
      shares={shares}
      currentUserId={user.id}
      onAddShare={addShare}
      onUpdateShare={updateShare}
      onRemoveShare={removeShare}
      isLoading={isLoading}
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
    />
  )
}
