import type { SharePermission } from '../dtos/collection-share.dto'
import type { User } from '@/features/users/models/user.model'

export interface CollectionShare {
  collectionId: string
  userId: string
  user?: User
  permission: SharePermission
  createdAt: Date
}

export interface CollectionShareCreate {
  userId: string
  permission: SharePermission
}

export interface CollectionShareUpdate {
  permission: SharePermission
}
