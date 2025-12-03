import type { Collection } from "../../models/collection.model"
import { CollectionCard } from "./CollectionCard"

interface CollectionsGridProps {
  items: Collection[]
  onEdit?: (c: Collection) => void
  onDelete?: (c: Collection) => void
  isSelected?: (id: string) => boolean
  onToggleSelection?: (id: string) => void
  selectionMode?: boolean
}

export function CollectionsGrid({
  items,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelection,
  selectionMode = false,
}: CollectionsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={onEdit}
          onDelete={onDelete}
          isSelected={isSelected?.(collection.id)}
          onToggleSelection={onToggleSelection}
          selectionMode={selectionMode}
        />
      ))}
    </section>
  )
}
