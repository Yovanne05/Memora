import { useState } from "react"
import { VisualizationCollectionsList } from "../components/VisualizationCollectionsList"
import type { Collection } from "@/features/collections/models/collection.model"
import { usePublicCollectionsQuery } from "../hooks/usePublicCollectionsQuery"
import { CollectionVisualizationView } from "../components/CollectionVisualizationView"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"

export function VisualizationPage() {
  const { data, isLoading, isError } = usePublicCollectionsQuery()
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  if (isLoading) {
    return <LoadingState message="Chargement des collections..." />
  }

  if (isError) {
    return <ErrorState message="Erreur lors du chargement des collections." />
  }

  const collections = data ?? []

  const handleSelect = (collection: Collection) => {
    setSelectedCollection(collection)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <aside className="w-80 shrink-0 border-r pr-4 overflow-y-auto" aria-label="Liste des collections">
        <h1 className="mb-3 text-lg font-semibold">Collections publiques</h1>
        <VisualizationCollectionsList
          collections={collections}
          selectedId={selectedCollection?.id}
          onSelect={handleSelect}
        />
      </aside>

      <main className="flex-1 min-h-0" aria-label="Visualisation de la collection">
        <CollectionVisualizationView collectionId={selectedCollection?.id} />
      </main>
    </div>
  )
}
