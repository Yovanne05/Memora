import type { UserCreateDto, UserDto, UserUpdateDto } from '../dto/user.dto'
import type { User, UserCreate, UserUpdate } from '../models/user.model'

export function dtoToUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    color: dto.color ?? null,
    role: dto.role,
    createdAt: dto.created_at,
    lastLogin: dto.last_login ?? null,
  }
}

export function toUserCreateDto(payload: UserCreate): UserCreateDto {
  return {
    email: payload.email,
    password: payload.password,
    username: payload.username ?? null,
    role: payload.role ?? 'client',
  }
}

export function toUserUpdateDto(payload: UserUpdate): UserUpdateDto {
  return {
    email: payload.email,
    password: payload.password,
    username: payload.username,
    role: payload.role,
  }
}
