import type { Collection } from "../types"
import { CollectionCard } from "./CollectionCard"

interface CollectionsGridProps {
  items: Collection[]
  onEdit?: (c: Collection) => void
  onDelete?: (c: Collection) => void
  onOpen?: (c: Collection) => void
}

export function CollectionsGrid({
  items,
  onEdit,
  onDelete,
  onOpen,
}: CollectionsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {items.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </section>
  )
}
