import type { PaginationParams } from "@/types/pagination"
import type { QueryParamValue } from "@/types/query-params"
import type { SearchResultType } from "./search.types"

export type SearchFilters = Record<string, QueryParamValue> & PaginationParams &  {
  query?: string
  tags?: string[]
  type?: SearchResultType | 'all'
  sortBy?: 'relevance' | 'date' | 'alphabetical'
  sortDir?: 'asc' | 'desc'
}
