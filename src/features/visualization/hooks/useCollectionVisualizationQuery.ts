import { useQuery } from "@tanstack/react-query"
import { visualizationService } from "../services/visualization.service"
import type { CollectionVisualization } from "../types/visualization.type"

export function useCollectionVisualizationQuery(collectionId?: string) {
  return useQuery<CollectionVisualization>({
    queryKey: ["visualization", "collection-visualization", collectionId],
    enabled: !!collectionId,
    queryFn: () => visualizationService.getCollectionVisualization(collectionId!),
  })
}
