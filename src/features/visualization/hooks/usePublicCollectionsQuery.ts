import { useQuery } from "@tanstack/react-query";
import type { Collection } from "@/features/collections/models/collection.model";
import { collectionsService } from "@/features/collections/services/collections.service";

export function usePublicCollectionsQuery() {
  return useQuery<Collection[]>({
    queryKey: ["visualization", "public-collections"],
    queryFn: async () => {
      const response = await collectionsService.list({
        visibility: "public",
        onlyWithNotes: true,
        sortBy: "created_at",
        sortDir: "desc",
      })
      return response.items
    },
  });
}
