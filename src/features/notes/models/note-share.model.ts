import type { SharePermission } from '../dtos/note-share.dto'
import type { User } from '@/features/users/models/user.model'

export interface NoteShare {
  noteId: string
  userId: string
  user?: User
  permission: SharePermission
  createdAt: Date
}

export interface NoteShareCreate {
  userId: string
  permission: SharePermission
}

export interface NoteShareUpdate {
  permission: SharePermission
}
