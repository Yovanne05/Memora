import { useQuery } from "@tanstack/react-query";
import type { Collection } from "@/features/collections/models/collection.model";
import { visualizationService } from "../services/visualization.service";

export function usePublicCollectionsQuery() {
  return useQuery<Collection[]>({
    queryKey: ["visualization", "public-collections"],
    queryFn: () => visualizationService.listPublicCollections(),
  });
}
