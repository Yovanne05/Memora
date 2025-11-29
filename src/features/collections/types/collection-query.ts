import type { QueryParamValue } from "@/types/query-params"

export type CollectionsFilters = Record<string, QueryParamValue> & {
  ownerId?: string
  sharedWithUserId?: string
  visibility?: "private" | "public"
  titleContains?: string
  ids?: string
  tagIds?: string 
  sortBy?: "title" | "created_at" | "updated_at"
  sortDir?: "asc" | "desc"
}