import { useQuery } from "@tanstack/react-query"
import { visualizationService } from "../services/visualization.service"
import type { Collection } from "@/features/collections/models/collection.model"

export function useCollectionVisualizationQuery(collectionId?: string) {
  return useQuery<Collection>({
    queryKey: ["visualization", "collection", collectionId],
    enabled: !!collectionId,
    queryFn: () => visualizationService.getCollectionForVisualization(collectionId!),
  })
}
