import type { HttpClient } from "@/lib/http-client";
import { httpClient } from "@/lib/http-client";
import type {
  CollectionShareCreateDto,
  CollectionShareDto,
  CollectionShareListDto,
  CollectionShareUpdateDto,
} from "../dtos/collection-share.dto";
import {
  collectionShareCreateToDto,
  collectionShareUpdateToDto,
  dtoToCollectionShare,
} from "../mappers/collection-share.mapper";
import type {
  CollectionShare,
  CollectionShareCreate,
  CollectionShareUpdate,
} from "../models/collection-share.model";
import type { ICollectionSharesService } from "./collection-shares.service.interface";

export function createCollectionSharesService(
  client: HttpClient = httpClient
): ICollectionSharesService {
  return {
    async list(collectionId: string): Promise<CollectionShare[]> {
      const data = await client.get<CollectionShareListDto>(
        "/collection-shares",
        { params: { collection_id: collectionId } }
      );
      return data.items.map(dtoToCollectionShare);
    },
    async listByUser(userId: string): Promise<CollectionShare[]> {
      const data = await client.get<CollectionShareListDto>(
        "/collection-shares",
        { params: { userId } }
      );
      return data.items.map(dtoToCollectionShare);
    },

    async create(
      collectionId: string,
      payload: CollectionShareCreate
    ): Promise<CollectionShare> {
      const dto = await client.post<
        CollectionShareDto,
        CollectionShareCreateDto
      >(
        `/collection-shares/${collectionId}`,
        collectionShareCreateToDto(payload)
      );
      return dtoToCollectionShare(dto);
    },

    async update(
      collectionId: string,
      userId: string,
      payload: CollectionShareUpdate
    ): Promise<CollectionShare> {
      const dto = await client.patch<
        CollectionShareDto,
        CollectionShareUpdateDto
      >(
        `/collection-shares/${collectionId}/shares/${userId}`,
        collectionShareUpdateToDto(payload)
      );
      return dtoToCollectionShare(dto);
    },

    async remove(collectionId: string, userId: string): Promise<void> {
      await client.delete<void>(
        `/collection-shares/${collectionId}/shares/${userId}`
      );
    },
  };
}

export const collectionSharesService = createCollectionSharesService();
export type { ICollectionSharesService as CollectionSharesService } from "./collection-shares.service.interface";
