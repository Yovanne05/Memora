import { CollectionsGrid } from "./CollectionsGrid"
import { CollectionsListSkeleton } from "./CollectionsListSkeleton"
import { CollectionsEmptyState } from "./CollectionsEmptyState"
import { CollectionsErrorAlert } from "./CollectionsErrorAlert"
import type { Collection } from "../../models/collection.model"

interface CollectionsContentProps {
  loading: boolean
  error: string | null
  collections: Collection[]
  onRetry: () => void
  onEdit: (collection: Collection) => void
  onDelete: (collection: Collection) => void
}

export function CollectionsContent({
  loading,
  error,
  collections,
  onRetry,
  onEdit,
  onDelete,
}: CollectionsContentProps) {
  if (error) {
    return <CollectionsErrorAlert message={error} onRetry={onRetry} />
  }

  if (loading) {
    return <CollectionsListSkeleton />
  }

  if (!collections.length) {
    return <CollectionsEmptyState />
  }

  return (
    <CollectionsGrid
      items={collections}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
