import type { Collection } from "@/features/collections/models/collection.model"
import { CollectionCard } from "@/features/collections/components/list/CollectionCard"

interface VisualizationCollectionsListProps {
  collections: Collection[]
  selectedId?: string
  onSelect: (c: Collection) => void
}

export function VisualizationCollectionsList({
  collections,
  selectedId,
  onSelect,
}: VisualizationCollectionsListProps) {
  if (!collections.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune collection publique disponible.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {collections.map((collection) => (
        <div
          key={collection.id}
          className={
            "rounded-md border p-1" +
            (collection.id === selectedId ? " border-primary bg-primary/5" : " border-transparent")
          }
        >
          <CollectionCard
            collection={collection}
            onCardClick={onSelect}
          />
        </div>
      ))}
    </div>
  )
}
