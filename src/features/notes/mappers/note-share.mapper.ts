import type {
  NoteShareDto,
  NoteShareCreateDto,
  NoteShareUpdateDto,
} from '../dtos/note-share.dto'
import type {
  NoteShare,
  NoteShareCreate,
  NoteShareUpdate,
} from '../models/note-share.model'
import { dtoToUser } from '@/features/users/mappers/user.mapper'

export function dtoToNoteShare(dto: NoteShareDto): NoteShare {
  const userId = dto.user?.id ?? dto.user_id

  if (!userId) {
    throw new Error('Note share is missing a user id')
  }

  return {
    noteId: dto.note_id,
    userId,
    user: dto.user ? dtoToUser(dto.user) : undefined,
    permission: dto.permission,
    createdAt: new Date(dto.created_at),
  }
}

export function noteShareCreateToDto(
  model: NoteShareCreate
): NoteShareCreateDto {
  return {
    user_id: model.userId,
    permission: model.permission,
  }
}

export function noteShareUpdateToDto(
  model: NoteShareUpdate
): NoteShareUpdateDto {
  return {
    permission: model.permission,
  }
}
