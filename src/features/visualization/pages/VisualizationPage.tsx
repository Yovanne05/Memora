import { CollectionsErrorAlert } from "@/features/collections/components/list/CollectionsErrorAlert"
import { CollectionsListSkeleton } from "@/features/collections/components/list/CollectionsListSkeleton"
import { VisualizationCollectionsList } from "../components/VisualizationCollectionsList"
import { usePublicCollectionsQuery } from "../hook/usePublicCollectionsQuery"

export function VisualizationPage() {
  const { data, isLoading, isError } = usePublicCollectionsQuery()

  if (isLoading) {
    return <CollectionsListSkeleton />
  }

  if (isError) {
    return <CollectionsErrorAlert message={""} />
  }

  const collections = data ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Collections publiques disponibles</h1>
      <VisualizationCollectionsList collections={collections} />
    </div>
  )
}
