import type { User } from '@/features/users/models/user.model'
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
} from '../models/auth.model'

export interface IAuthService {
  login(payload: LoginPayload): Promise<AuthSession>
  register(payload: RegisterPayload): Promise<User>
  getProfile(): Promise<User>
}
