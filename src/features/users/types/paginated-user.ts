import type { User } from "../models/user.model"
import type { PaginatedResponse } from "@/types/pagination"

export type PaginatedUsers = PaginatedResponse<User>
