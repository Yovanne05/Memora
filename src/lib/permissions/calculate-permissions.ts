import type { UserPermission, PermissionCalculationInput } from './types'

export function calculateUserPermission(
  input: PermissionCalculationInput
): UserPermission | null {
  const { userId, userPermission, userAccess, parentPermission } = input

  if (!userId) {
    return null
  }

  if (userPermission) {
    return userPermission
  }

  const access = userAccess?.find((access) => access.userId === userId)
  if (access) {
    return access.permission
  }

  if (parentPermission) {
    return parentPermission
  }

  return null
}
