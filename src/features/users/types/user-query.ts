import type { QueryParamValue } from "@/types/query-params"
import type { PaginationParams } from "@/types/pagination"

export type UsersFilters = Record<string, QueryParamValue> & PaginationParams & {
  email?: string
  username?: string
  role?: "client" | "admin" | "super_admin"
  search?: string
  sortBy?: "email" | "username" | "created_at"
  sortDir?: "asc" | "desc"
}
