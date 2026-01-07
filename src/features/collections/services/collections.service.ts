import type {
  CollectionDto,
  CollectionsListDto,
  CollectionCreateDto,
  CollectionUpdateDto,
} from "../dtos/collection.dto";
import {
  dtoToCollection,
  toCollectionCreateDto,
  toCollectionUpdateDto,
} from "../mappers/collection.mapper";
import { httpClient, type HttpClient } from "@/lib/http-client";
import type { ICollectionsService } from "./collections.service.interface";
import type {
  CollectionCreate,
  CollectionUpdate,
} from "../models/collection.model";
import type { CollectionsFilters } from "../types/collection-query";

export function createCollectionsService(
  client: HttpClient = httpClient
): ICollectionsService {
  return {
    async list(params?: CollectionsFilters) {
      const data = await client.get<CollectionsListDto>("/collections", {
        params,
      });
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      const total = Array.isArray(data)
        ? items.length
        : (data?.total ?? items.length);

      return {
        items: items.map(dtoToCollection),
        total,
        offset: params?.offset ?? 0,
        limit: params?.limit ?? 10,
      };
    },
    async get(id: string) {
      const dto = await client.get<CollectionDto>(`/collections/${id}`);
      return dtoToCollection(dto);
    },
    async create(payload: CollectionCreate) {
      const dto = await client.post<CollectionDto, CollectionCreateDto>(
        "/collections",
        toCollectionCreateDto(payload)
      );
      return dtoToCollection(dto);
    },
    async update(id: string, payload: CollectionUpdate) {
      const dto = await client.patch<CollectionDto, CollectionUpdateDto>(
        `/collections/${id}`,
        toCollectionUpdateDto(payload)
      );
      return dtoToCollection(dto);
    },
    async remove(id: string) {
      await client.delete<void>(`/collections/${id}`);
    },
    async addFavorite(id: string) {
      await client.post<void, never>(`/collections/${id}/favorites`, undefined as never)
    },

    async removeFavorite(id: string) {
      await client.delete<void>(`/collections/${id}/favorites`)
    },
  };
}

export const collectionsService = createCollectionsService();
export type { ICollectionsService as CollectionsService } from "./collections.service.interface";
