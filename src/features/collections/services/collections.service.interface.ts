import type { Collection, CollectionCreate, CollectionUpdate } from "../models/collection.model"
import type { CollectionsListParams } from "../types/paginated-collection"

export interface ICollectionsService {
  list(params?: CollectionsListParams): Promise<Collection[]>
  get(id: string): Promise<Collection>
  create(payload: CollectionCreate): Promise<Collection>
  update(id: string, payload: CollectionUpdate): Promise<Collection>
  remove(id: string): Promise<void>
}
