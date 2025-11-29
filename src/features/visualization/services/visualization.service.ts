import { collectionsService } from "@/features/collections/services/collections.service"

export function createVisualizationService() {
  return {
    async listCollectionWithNote() {
      return collectionsService.list()
    }
  }
}

export const visualizationService = createVisualizationService()
