import { authMeDtoToUser, authResponseDtoToSession, toLoginDto, toRegisterDto } from "../mappers/auth.mapper"
import type { AuthSession, LoginPayload, RegisterPayload } from "../models/auth.model"
import type { AuthMeResponseDto, AuthResponseDto, LoginDto, RegisterDto } from "../dtos/auth.dto"
import type { IAuthService } from "./auth.service.interface"
import { httpClient, type HttpClient } from "@/lib/http-client"
import { dtoToUser } from "@/features/users/mappers/user.mapper"
import type { UserDto } from "@/features/users/dto/user.dto"

export function createAuthService(client: HttpClient = httpClient): IAuthService {
  return {
    async login(payload: LoginPayload): Promise<AuthSession> {
      const response = await client.post<AuthResponseDto, LoginDto>("/sessions", toLoginDto(payload))
      return authResponseDtoToSession(response)
    },
    async register(payload: RegisterPayload) {
      const response = await client.post<UserDto, RegisterDto>("/users", toRegisterDto(payload))
      return dtoToUser(response)
    },
    async getProfile() {
      const response = await client.get<AuthMeResponseDto>("/sessions/me")
      return authMeDtoToUser(response)
    },
    async logout() {
      await client.post<void, undefined>("/sessions/logout")
    },
  }
}

export const authService = createAuthService()
export type { IAuthService as AuthService } from "./auth.service.interface"
