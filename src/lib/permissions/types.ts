export type UserPermission = 'read' | 'write' | 'owner'

export interface UserAccess {
  userId: string
  permission: UserPermission
}

export interface PermissionCalculationInput {
  userId: string | undefined
  userPermission?: UserPermission | null
  userAccess?: UserAccess[]
  parentPermission?: UserPermission | null
}
