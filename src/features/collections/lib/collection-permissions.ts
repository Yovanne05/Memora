import type { Collection } from '../models/collection.model'
import type { User } from '@/features/users/models/user.model'

export function canUserManageCollection(
  collection: Collection,
  user: User | null
): boolean {
  if (!user) return false

  const isOriginalOwner = collection.ownerId === user.id
  const hasOwnerPermission = collection.userPermission === 'owner'
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'

  return isOriginalOwner || hasOwnerPermission || isAdmin
}

export function filterManageableCollections(
  collections: Collection[],
  user: User | null
): Collection[] {
  return collections.filter((collection) =>
    canUserManageCollection(collection, user)
  )
}
