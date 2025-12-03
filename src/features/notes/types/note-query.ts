import type { QueryParamValue } from "@/types/query-params"

export type NotesFilters = Record<string, QueryParamValue> & {
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

