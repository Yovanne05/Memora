import type { User, UserCreate, UserUpdate } from "../models/user.model"
import type { UsersFilters } from "../types/user-query"
import type { PaginatedUsers } from "../types/paginated-user"

export interface IUsersService {
  list(params?: UsersFilters): Promise<PaginatedUsers>
  get(id: string): Promise<User>
  create(payload: UserCreate): Promise<User>
  update(id: string, payload: UserUpdate): Promise<User>
  remove(id: string): Promise<void>
}
