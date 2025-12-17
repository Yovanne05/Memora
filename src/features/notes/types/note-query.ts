import type { QueryParamValue } from "@/types/query-params"
import type { PaginationParams } from "@/types/pagination"

export type NotesFilters = Record<string, QueryParamValue> & PaginationParams & {
  ownerId?: string
  collectionId?: string
  sharedWithUserId?: string
  visibility?: "private" | "public"
  titleContains?: string
  contentContains?: string
  ids?: string
  tagIds?: string
  sortBy?: "title" | "created_at" | "updated_at"
  sortDir?: "asc" | "desc"
}

