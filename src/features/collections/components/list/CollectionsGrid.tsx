import type { Collection } from "../../models/collection.model"
import { CollectionCard } from "./CollectionCard"

interface CollectionsGridProps {
  items: Collection[]
  onEdit?: (c: Collection) => void
  onDelete?: (c: Collection) => void
}

export function CollectionsGrid({
  items,
  onEdit,
  onDelete,
}: CollectionsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  )
}
