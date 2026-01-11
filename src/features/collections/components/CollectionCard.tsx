import { memo, useCallback, useState } from 'react'
import { FileText } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

import type { Collection } from '../models/collection.model'
import { ResourceCard } from '@/components/shared/ResourceCard'
import { buildCollectionCardActions } from './collection-card/actions'
import { CollectionCardBadges } from './collection-card/CollectionCardBadges'
import { CollectionCardFavoriteButton } from './collection-card/CollectionCardFavoriteButton'
import { CollectionCardFooter } from './collection-card/CollectionCardFooter'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ReportDialog } from '@/features/report/components/ReportDialog'

interface CollectionCardProps {
  readonly collection: Collection
  readonly onEdit?: (collection: Collection) => void
  readonly onShare?: (collection: Collection) => void
  readonly onDelete?: (collection: Collection) => void
  readonly onCardClick?: (collection: Collection) => void
  readonly isSelected?: boolean
  readonly onToggleSelection?: (id: string) => void
  readonly selectionMode?: boolean
  readonly compact?: boolean
  readonly readOnly?: boolean
  readonly showReportButton?: boolean
}

export const CollectionCard = memo(function CollectionCard({
  collection,
  onEdit,
  onShare,
  onDelete,
  onCardClick,
  isSelected = false,
  onToggleSelection,
  selectionMode = false,
  compact = false,
  readOnly = false,
  showReportButton = false,
}: Readonly<CollectionCardProps>) {
  const router = useRouter()
  const { user } = useAuth()
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const favorite = collection.isFavorite === true
  const isOwner = Boolean(user && collection.ownerId === user.id)
  const canManage =
    collection.userPermission === 'owner' ||
    isOwner ||
    user?.role === 'admin' ||
    user?.role === 'super_admin'
  const canWrite = canManage || collection.userPermission === 'write'

  const handleNavigate = useCallback(() => {
    router.navigate({
      to: '/app/workspace/collections/$collectionId',
      params: { collectionId: collection.id },
    })
  }, [router, collection.id])

  const handleCardClick = useCallback(() => {
    if (onCardClick) {
      onCardClick(collection)
      return
    }
    handleNavigate()
  }, [collection, handleNavigate, onCardClick])

  const handleReport = useCallback(() => {
    setReportDialogOpen(true)
  }, [])

  const actions = buildCollectionCardActions({
    collection,
    onEdit: canWrite ? onEdit : undefined,
    onShare: canManage ? onShare : undefined,
    onDelete: canManage ? onDelete : undefined,
    onReport: showReportButton ? handleReport : undefined,
  })

  return (
    <>
      <ResourceCard
        id={collection.id}
        title={collection.name}
        description={collection.description}
        icon={FileText}
        onClick={handleCardClick}
        onToggleSelection={onToggleSelection}
        actions={actions}
        headerActions={
          <CollectionCardFavoriteButton
            collectionId={collection.id}
            favorite={favorite}
          />
        }
        isSelected={isSelected}
        selectionMode={selectionMode}
        compact={compact}
        readOnly={readOnly}
        badges={<CollectionCardBadges collection={collection} />}
        footer={
          <CollectionCardFooter collection={collection} compact={compact} />
        }
      />

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        targetType="collection"
        targetId={collection.id}
        targetTitle={collection.name}
      />
    </>
  )
})
