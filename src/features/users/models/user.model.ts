export type UserRole = 'client' | 'admin' | 'super_admin'

export interface User {
  id: string
  email: string
  username: string | null
  color?: string | null
  role: UserRole
  createdAt: string
  lastLogin?: string | null
}

export interface UserCreate {
  email: string
  password: string
  username?: string | null
  role?: UserRole
}

export interface UserUpdate {
  email?: string
  password?: string
  username?: string | null
  role?: UserRole
}
