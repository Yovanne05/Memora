import type { Collection, CollectionCreate, CollectionUpdate } from "../models/collection.model"

export interface CollectionsService {
  list(): Promise<Collection[]>
  get(id: string): Promise<Collection>
  create(payload: CollectionCreate): Promise<Collection>
  update(id: string, payload: CollectionUpdate): Promise<Collection>
  remove(id: string): Promise<void>
}
