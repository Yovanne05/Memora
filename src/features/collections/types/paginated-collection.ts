import type { Collection } from "../models/collection.model"
import type { CollectionsFilters } from "./collection-query"

export interface PaginatedCollections {
  items: Collection[]
  total: number
  page: number
  limit: number
}

export interface CollectionsListParams extends CollectionsFilters {
  limit?: number
  offset?: number
}