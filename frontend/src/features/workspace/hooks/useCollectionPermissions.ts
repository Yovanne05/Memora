import type { Collection } from '@/features/collections/models/collection.model'
import type { User } from '@/features/users/models/user.model'

type CollectionPermissions = {
  canManage: boolean
  canWrite: boolean
  canAddNote: boolean
}

export function useCollectionPermissions(
  collection: Collection | null,
  user: User | null
): CollectionPermissions {
  const hasCollection = Boolean(collection)
  const isOwner = Boolean(user && collection && collection.ownerId === user.id)
  const userPermission = collection?.userPermission ?? null

  const canManage =
    hasCollection &&
    (userPermission === 'owner' ||
      isOwner ||
      user?.role === 'admin' ||
      user?.role === 'super_admin')

  const canWrite = hasCollection && (canManage || userPermission === 'write')
  const canAddNote = hasCollection && isOwner

  return {
    canManage,
    canWrite,
    canAddNote,
  }
}
