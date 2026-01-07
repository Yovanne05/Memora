import type { Collection } from "@/features/collections/models/collection.model"
import { CollectionCard } from "@/features/collections/components/CollectionCard"
import { cn } from "@/lib/utils"

interface VisualizationCollectionsListProps {
  collections: Collection[]
  selectedId?: string
  onSelect: (collection: Collection) => void
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
    <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
      {collections.map((collection) => {
        const isSelected = collection.id === selectedId

        return (
          <div
            key={collection.id}
            className={cn(
              "rounded-md border p-1",
              isSelected ? "border-primary bg-primary/5" : "border-transparent"
            )}
          >
            <CollectionCard
              collection={collection}
              onCardClick={onSelect}
              compact
              readOnly
            />
          </div>
        )
      })}
    </div>
  )
}
