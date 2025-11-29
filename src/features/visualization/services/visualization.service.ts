import { collectionsService } from "@/features/collections/services/collections.service"

export function createVisualizationService() {
  return {
    async listPublicCollections() {
      return collectionsService.list({ visibility: "public", onlyWithNotes: true } )
    }
  }
}

export const visualizationService = createVisualizationService()
