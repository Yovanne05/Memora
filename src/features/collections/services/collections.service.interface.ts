import type { Collection, CollectionCreate, CollectionUpdate } from "../models/collection.model"
import type { CollectionsFilters } from "../types/collection-query"
import type { PaginatedCollections } from "../types/paginated-collection"

export interface ICollectionsService {
  list(params?: CollectionsFilters): Promise<PaginatedCollections>
  get(id: string): Promise<Collection>
  create(payload: CollectionCreate): Promise<Collection>
  update(id: string, payload: CollectionUpdate): Promise<Collection>
  remove(id: string): Promise<void>
}
