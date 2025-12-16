import type { User } from "@/features/users/models/user.model"

export interface LoginPayload {
  identifier: string
  password: string
}

export interface RegisterPayload {
  displayName: string
  email: string
  password: string
  username: string
}

export interface AuthSession {
  accessToken: string
  user: User
}
