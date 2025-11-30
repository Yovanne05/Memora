import type { Collection } from "@/features/collections/models/collection.model"
import { collectionsService } from "@/features/collections/services/collections.service"
import { httpClient } from "@/lib/http-client"
import type { CollectionVisualization } from "../types/visualization.type"

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

    async getCollectionVisualization(collectionId: string): Promise<CollectionVisualization> {
      return httpClient.get<CollectionVisualization>(`/collections/${collectionId}/visualization`)
    },
  }
}

export const visualizationService = createVisualizationService()