import type { Collection } from '../../models/collection.model'
import type { ResourceCardAction } from '@/components/shared/ResourceCard'

type BuildActionsArgs = {
  collection: Collection
  onEdit?: (collection: Collection) => void
  onShare?: (collection: Collection) => void
  onDelete?: (collection: Collection) => void
  onReport?: (collection: Collection) => void
}

export function buildCollectionCardActions({
  collection,
  onEdit,
  onShare,
  onDelete,
  onReport,
}: BuildActionsArgs) {
  const actions: ResourceCardAction[] = []

  if (onEdit) {
    actions.push({
      label: 'Modifier',
      onClick: (event) => {
        event.stopPropagation()
        onEdit(collection)
      },
    })
  }

  if (onShare) {
    actions.push({
      label: 'Partager',
      onClick: (event) => {
        event.stopPropagation()
        onShare(collection)
      },
    })
  }

  if (onDelete) {
    actions.push({
      label: 'Supprimer',
      variant: 'destructive',
      onClick: (event) => {
        event.stopPropagation()
        onDelete(collection)
      },
    })
  }

  if (onReport) {
    actions.push({
      label: 'Signaler',
      onClick: (event) => {
        event.stopPropagation()
        onReport(collection)
      },
    })
  }

  return actions
}
