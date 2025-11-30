import { useQuery } from "@tanstack/react-query"
import { visualizationService } from "../services/visualization.service"
import type { Collection } from "@/features/collections/models/collection.model"

export function usePublicCollectionsQuery() {
  return useQuery<Collection[]>({
    queryKey: ["visualization", "public-collections"],
    queryFn: () => visualizationService.listPublicCollections(),
    staleTime: 5 * 60 * 1000,
  })
}
