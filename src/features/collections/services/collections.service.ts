import type {
  CollectionDto,
  CollectionsListDto,
  CollectionCreateDto,
  CollectionUpdateDto,
} from "../dtos/collection.dto"
import {
  dtoToCollection,
  toCollectionCreateDto,
  toCollectionUpdateDto,
} from "../mappers/collection.mapper"
import { httpClient, type HttpClient } from "@/lib/http-client"
import type { CollectionsService } from "./collections.service.interface"
import type { CollectionCreate, CollectionUpdate } from "../models/collection.model"

export function createCollectionsService(client: HttpClient = httpClient): CollectionsService {
  return {
    async list() {
      const data = await client.get<CollectionsListDto>("/collections")
      const items = Array.isArray(data) ? data : data?.items ?? []
      return items.map(dtoToCollection)
    },
    async get(id: string) {
      const dto = await client.get<CollectionDto>(`/collections/${id}`)
      return dtoToCollection(dto)
    },
    async create(payload: CollectionCreate) {
      const dto = await client.post<CollectionDto, CollectionCreateDto>(
        "/collections",
        toCollectionCreateDto(payload)
      )
      return dtoToCollection(dto)
    },
    async update(id: string, payload: CollectionUpdate) {
      const dto = await client.patch<CollectionDto, CollectionUpdateDto>(
        `/collections/${id}`,
        toCollectionUpdateDto(payload)
      )
      return dtoToCollection(dto)
    },
    async remove(id: string) {
      await client.delete<void>(`/collections/${id}`)
    },
  }
}

export const collectionsService = createCollectionsService()
export type { CollectionsService } from "./collections.service.interface"
