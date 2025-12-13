import type { QueryParamValue } from "@/types/query-params"

export type UsersFilters = Record<string, QueryParamValue> &{
  email?: string
  username?: string
  role?: "client" | "admin" | "super_admin"
  search?: string
  sortBy?: "email" | "username" | "created_at"
  sortDir?: "asc" | "desc"
}
