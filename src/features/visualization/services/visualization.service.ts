import type { Collection } from "@/features/collections/models/collection.model"
import { collectionsService } from "@/features/collections/services/collections.service"

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

    async getCollectionForVisualization(collectionId: string): Promise<Collection> {
      return collectionsService.get(collectionId)
    },
  }
}

export const visualizationService = createVisualizationService()