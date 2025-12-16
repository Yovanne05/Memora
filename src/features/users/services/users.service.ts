import type {
  UserDto,
  UsersListDto,
  UserCreateDto,
  UserUpdateDto,
} from "../dto/user.dto"
import {
  dtoToUser,
  toUserCreateDto,
  toUserUpdateDto,
} from "../mappers/user.mapper"
import { httpClient, type HttpClient } from "@/lib/http-client"
import type { IUsersService } from "./users.service.interface"
import type { UsersFilters } from "../types/user-query"
import type { PaginatedUsers } from "../types/paginated-user"
import type { UserCreate, UserUpdate } from "../models/user.model"

export function createUsersService(client: HttpClient = httpClient): IUsersService {
  return {
    async list(params?: UsersFilters): Promise<PaginatedUsers> {
      const data = await client.get<UsersListDto>("/users", { params })
      const items = Array.isArray(data) ? data : data?.items ?? []
      return {
        items: items.map(dtoToUser),
        total: Array.isArray(data) ? data.length : (data?.total ?? 0),
        limit: params?.limit ?? 10,
        offset: params?.offset ?? 0,
      }
    },
    async get(id: string) {
      const dto = await client.get<UserDto>(`/users/${id}`)
      return dtoToUser(dto)
    },
    async create(payload: UserCreate) {
      const dto = await client.post<UserDto, UserCreateDto>(
        "/users",
        toUserCreateDto(payload)
      )
      return dtoToUser(dto)
    },
    async update(id: string, payload: UserUpdate) {
      const dto = await client.patch<UserDto, UserUpdateDto>(
        `/users/${id}`,
        toUserUpdateDto(payload)
      )
      return dtoToUser(dto)
    },
    async remove(id: string) {
      await client.delete<void>(`/users/${id}`)
    },
  }
}

export const usersService = createUsersService()
export type { IUsersService as UsersService } from "./users.service.interface"
