import { useState } from "react"
import { VisualizationCollectionsList } from "../components/VisualizationCollectionsList"
import type { Collection } from "@/features/collections/models/collection.model"
import { usePublicCollectionsQuery } from "../hook/usePublicCollectionsQuery"
import { CollectionVisualizationView } from "../components/CollectionVisualizationView"

export function VisualizationPage() {
  const { data, isLoading, isError } = usePublicCollectionsQuery()
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  if (isLoading) {
    return <div>Chargement des collections...</div>
  }

  if (isError) {
    return <div>Erreur lors du chargement des collections.</div>
  }

  const collections = data ?? []

  const handleSelect = (collection: Collection) => {
    setSelectedCollection(collection)
  }

  return (
    <div className="flex h-full gap-4">
      {/* Colonne gauche : liste des collections */}
      <div className="w-80 shrink-0 border-r pr-4">
        <h1 className="mb-3 text-lg font-semibold">Collections publiques</h1>
        <VisualizationCollectionsList
          collections={collections}
          selectedId={selectedCollection?.id}
          onSelect={handleSelect}
        />
      </div>

      {/* Colonne droite : graphe de la collection sélectionnée */}
      <div className="flex-1">
        <CollectionVisualizationView collectionId={selectedCollection?.id} />
      </div>
    </div>
  )
}
