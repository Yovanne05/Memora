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
import { collectionsService } from "./collections.service";

export function createCollectionSharesService(
  client: HttpClient = httpClient
): ICollectionSharesService {
  return {
    async list(collectionId: string): Promise<CollectionShare[]> {
      const data = await client.get<CollectionShareListDto>(
        `/collections/${collectionId}/shares`
      );
      return data.items.map(dtoToCollectionShare);
    },
    async listByUser(userId: string): Promise<CollectionShare[]> {
      if (!userId) {
        return []
      }
      const data = await collectionsService.list({
        limit: 200,
        offset: 0,
        sharedWithUserId: userId,
      });
      return data.items
        .filter((collection) => collection.ownerId !== userId)
        .map((collection) => ({
          collectionId: collection.id,
          userId,
          permission: "read",
          createdAt: new Date(collection.createdAt),
        }));
    },

    async create(
      collectionId: string,
      payload: CollectionShareCreate
    ): Promise<CollectionShare> {
      const dto = await client.post<
        CollectionShareDto,
        CollectionShareCreateDto
      >(
        `/collections/${collectionId}/shares`,
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
        `/collections/${collectionId}/shares/${userId}`,
        collectionShareUpdateToDto(payload)
      );
      return dtoToCollectionShare(dto);
    },

    async remove(collectionId: string, userId: string): Promise<void> {
      await client.delete<void>(
        `/collections/${collectionId}/shares/${userId}`
      );
    },
  };
}

export const collectionSharesService = createCollectionSharesService();
export type { ICollectionSharesService as CollectionSharesService } from "./collection-shares.service.interface";
