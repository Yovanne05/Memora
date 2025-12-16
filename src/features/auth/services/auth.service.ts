import { authMeDtoToUser, authResponseDtoToSession, toLoginDto, toRegisterDto } from "../mappers/auth.mapper"
import type { AuthSession, LoginPayload, RegisterPayload } from "../models/auth.model"
import type { AuthMeResponseDto, AuthResponseDto, LoginDto, RegisterDto } from "../dtos/auth.dto"
import type { IAuthService } from "./auth.service.interface"
import { httpClient, type HttpClient } from "@/lib/http-client"

export function createAuthService(client: HttpClient = httpClient): IAuthService {
  return {
    async login(payload: LoginPayload): Promise<AuthSession> {
      const response = await client.post<AuthResponseDto, LoginDto>("/auth/login", toLoginDto(payload))
      return authResponseDtoToSession(response)
    },
    async register(payload: RegisterPayload): Promise<AuthSession> {
      const response = await client.post<AuthResponseDto, RegisterDto>("/auth/register", toRegisterDto(payload))
      return authResponseDtoToSession(response)
    },
    async getProfile() {
      const response = await client.get<AuthMeResponseDto>("/auth/me")
      return authMeDtoToUser(response)
    },
    async logout() {
      await client.post<void, undefined>("/auth/logout")
    },
  }
}

export const authService = createAuthService()
export type { IAuthService as AuthService } from "./auth.service.interface"
