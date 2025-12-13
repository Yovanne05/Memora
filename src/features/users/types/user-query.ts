export interface UsersFilters {
  email?: string
  username?: string
  role?: "client" | "admin" | "super_admin"
  search?: string
  sortBy?: "email" | "username" | "created_at"
  sortDir?: "asc" | "desc"
}
