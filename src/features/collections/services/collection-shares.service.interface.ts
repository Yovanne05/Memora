import type {
  CollectionShare,
  CollectionShareCreate,
  CollectionShareUpdate,
} from "../models/collection-share.model";

export interface ICollectionSharesService {
  list(collectionId: string): Promise<CollectionShare[]>;
  listByUser(userId: string): Promise<CollectionShare[]>;
  create(
    collectionId: string,
    payload: CollectionShareCreate
  ): Promise<CollectionShare>;
  update(
    collectionId: string,
    userId: string,
    payload: CollectionShareUpdate
  ): Promise<CollectionShare>;
  remove(collectionId: string, userId: string): Promise<void>;
}
