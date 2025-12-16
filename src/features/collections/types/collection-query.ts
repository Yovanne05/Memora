import type { QueryParamValue } from "@/types/query-params"
import type { PaginationParams } from "@/types/pagination"

export type CollectionsFilters = Record<string, QueryParamValue> & PaginationParams & {
  ownerId?: string
  sharedWithUserId?: string
  visibility?: "private" | "public"
  titleContains?: string
  ids?: string
  tagIds?: string
  onlyWithNotes?: boolean
  sortBy?: "title" | "created_at" | "updated_at"
  sortDir?: "asc" | "desc"
}