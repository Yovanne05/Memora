import { useState } from "react"
import { VisualizationCollectionsList } from "../components/VisualizationCollectionsList"
import type { Collection } from "@/features/collections/models/collection.model"
import { usePublicCollectionsQuery } from "../hooks/usePublicCollectionsQuery"
import { CollectionVisualizationView } from "../components/CollectionVisualizationView"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function VisualizationPage() {
  const { data, isLoading, isError } = usePublicCollectionsQuery()
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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
    <div className="flex h-[calc(100vh-8rem)] gap-4 relative">
      {!isSidebarCollapsed && (
        <aside className="w-64 shrink-0 border-r pr-4 overflow-y-auto" aria-label="Liste des collections">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">Collections publiques</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsSidebarCollapsed(true)}
              aria-label="Masquer la liste des collections"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <VisualizationCollectionsList
            collections={collections}
            selectedId={selectedCollection?.id}
            onSelect={handleSelect}
          />
        </aside>
      )}

      {isSidebarCollapsed && (
        <div className="shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setIsSidebarCollapsed(false)}
            aria-label="Afficher la liste des collections"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      <main className="flex-1 min-h-0" aria-label="Visualisation de la collection">
        <CollectionVisualizationView collectionId={selectedCollection?.id} />
      </main>
    </div>
  )
}
