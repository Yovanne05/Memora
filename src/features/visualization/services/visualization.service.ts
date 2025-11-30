import { collectionsService } from "@/features/collections/services/collections.service"
import type { Collection } from "@/features/collections/models/collection.model"

export function createVisualizationService() {
  return {
    async listPublicCollections(): Promise<Collection[]> {
      return collectionsService.list({
        visibility: "public",
        onlyWithNotes: true,
        sortBy: "created_at",
        sortDir: "desc",
      })
    },
  }
}

export const visualizationService = createVisualizationService()
