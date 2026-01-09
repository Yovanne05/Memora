import type { Collection } from '../models/collection.model'
import { CollectionCard } from './CollectionCard'

interface CollectionsGridProps {
  items: Collection[]
  onEdit?: (collection: Collection) => void
  onShare?: (collection: Collection) => void
  onDelete?: (collection: Collection) => void
  compact?: boolean
}

export function CollectionsGrid({
  items,
  onEdit,
  onShare,
  onDelete,
  compact = false,
}: Readonly<CollectionsGridProps>) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={onEdit}
          onShare={onShare}
          onDelete={onDelete}
          compact={compact}
        />
      ))}
    </section>
  )
}
