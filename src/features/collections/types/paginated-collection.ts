import type { Collection } from "../models/collection.model"
import type { CollectionsFilters } from "./collection-query"
import type { ListParams, PaginatedResponse } from "@/types/pagination"

export type PaginatedCollections = PaginatedResponse<Collection>
export type CollectionsListParams = ListParams<CollectionsFilters>