import { dtoToUser } from '@/features/users/mappers/user.mapper'
import type { User } from '@/features/users/models/user.model'
import type {
  AuthMeResponseDto,
  AuthResponseDto,
  AuthUserDto,
  LoginDto,
  RegisterDto,
} from '../dtos/auth.dto'
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
} from '../models/auth.model'

export function authUserDtoToUser(dto: AuthUserDto): User {
  return dtoToUser(dto)
}

export function authResponseDtoToSession(dto: AuthResponseDto): AuthSession {
  return {
    accessToken: dto.access_token,
    user: authUserDtoToUser(dto.user),
  }
}

export function authMeDtoToUser(dto: AuthMeResponseDto): User {
  return authUserDtoToUser(dto.user)
}

export function toLoginDto(payload: LoginPayload): LoginDto {
  return {
    identifier: payload.identifier,
    password: payload.password,
  }
}

export function toRegisterDto(payload: RegisterPayload): RegisterDto {
  return {
    email: payload.email,
    password: payload.password,
    username: payload.username,
  }
}
