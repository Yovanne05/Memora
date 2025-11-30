import { CollectionCard } from "@/features/collections/components/list/CollectionCard"
import type { Collection } from "@/features/collections/models/collection.model"
import { useRouter } from "@tanstack/react-router";

interface VisualizationCollectionsListProps {
  collections: Collection[]
}

export function VisualizationCollectionsList({
  collections,
}: VisualizationCollectionsListProps) {
  const router = useRouter();

  if (!collections.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune collection publique disponible.
      </p>
    )
  }

  const handleVisualizationClick = (collection: Collection) => {
    router.navigate({
      to: "/app/visualization/collections/$id",
      params: { id: collection.id },
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} onCardClick={handleVisualizationClick} />
      ))}
    </div>
  )
}
