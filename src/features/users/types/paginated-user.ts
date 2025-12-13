import type { User } from "../models/user.model"
import type { UsersFilters } from "./user-query"
import type { ListParams, PaginatedResponse } from "@/types/pagination"

export type PaginatedUsers = PaginatedResponse<User>
export type UsersListParams = ListParams<UsersFilters>
