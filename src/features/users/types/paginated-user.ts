import type { User } from "../models/user.model"
import type { UsersFilters } from "./user-query"

export interface PaginatedUsers {
  items: User[]
  total: number
  page: number
  limit: number
}

export interface UsersListParams extends UsersFilters {
  limit?: number
  offset?: number
}
