import { useQuery } from "@tanstack/react-query"
import { collectionsService } from "@/features/collections/services/collections.service"
import type { Collection } from "@/features/collections/models/collection.model"

export function useCollectionVisualizationQuery(collectionId?: string) {
  return useQuery<Collection>({
    queryKey: ["visualization", "collection", collectionId],
    enabled: !!collectionId,
    queryFn: () => collectionsService.get(collectionId!),
  })
}
