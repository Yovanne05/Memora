import { calculateUserPermission } from '@/lib/permissions'
import type { NoteCreateDto, NoteDto, NoteUpdateDto } from '../dtos/note.dto'
import type {
  Note,
  NoteCreate,
  NoteUpdate,
  NotePermission,
} from '../models/note.model'

function getCurrentUserPermission(
  dto: NoteDto,
  currentUserId?: string
): NotePermission | null {
  return calculateUserPermission({
    userId: currentUserId,
    userPermission: dto.user_permission,
    userAccess: dto.user_access?.map((access) => ({
      userId: access.user_id,
      permission: access.permission,
    })),
    parentPermission: dto.collection_permission,
  })
}

export function dtoToNote(dto: NoteDto, currentUserId?: string): Note {
  return {
    id: dto.id,
    collectionId: dto.collection_id,
    collectionName: dto.collection_name ?? null,
    ownerId: dto.owner_id,
    ownerUsername: dto.owner_username,
    title: dto.title,
    content: dto.content ?? null,
    isFavorite: dto.is_favorite ?? false,
    tags: dto.tags ?? [],
    visibility: dto.visibility ?? 'private',
    userPermission: getCurrentUserPermission(dto, currentUserId),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export function dtoToNoteWithoutUser(dto: NoteDto): Note {
  return dtoToNote(dto)
}

export function toNoteCreateDto(payload: NoteCreate): NoteCreateDto {
  return {
    collection_id: payload.collectionId ?? null,
    owner_id: payload.ownerId,
    title: payload.title,
    tags: payload.tags,
    visibility: payload.visibility ?? 'private',
  }
}

export function toNoteUpdateDto(payload: NoteUpdate): NoteUpdateDto {
  return {
    collection_id: payload.collectionId,
    title: payload.title,
    tags: payload.tags,
    visibility: payload.visibility,
  }
}
