import type { User, UserCreate, UserUpdate } from "../models/user.model"
import type { UsersListParams } from "../types/paginated-user"

export interface IUsersService {
  list(params?: UsersListParams): Promise<User[]>
  get(id: string): Promise<User>
  create(payload: UserCreate): Promise<User>
  update(id: string, payload: UserUpdate): Promise<User>
  remove(id: string): Promise<void>
}
