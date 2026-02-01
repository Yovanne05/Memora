import type { QueryParamValue } from "@/types/query-params"
import type { PaginationParams } from "@/types/pagination"

export type NoteLinksFilters = Record<string, QueryParamValue> & PaginationParams & {
  noteId?: string
  sortBy?: "created_at"
  sortDir?: "asc" | "desc"
}