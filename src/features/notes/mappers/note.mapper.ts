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
  // 1. Si user_permission existe, l'utiliser (droit explicite sur la note)
  if (dto.user_permission) {
    return dto.user_permission
  }

  // 2. Sinon, chercher dans user_access (droit explicite sur la note)
  if (dto.user_access && currentUserId) {
    const userAccess = dto.user_access.find(
      (access) => access.user_id === currentUserId
    )
    if (userAccess) {
      return userAccess.permission
    }
  }

  // 3. Si pas de droit explicite sur la note, hériter des droits de la collection
  if (dto.collection_permission) {
    return dto.collection_permission
  }

  return null
}

export function dtoToNote(
  dto: NoteDto,
  currentUserId?: string | undefined
): Note {
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

// Version sans paramètre supplémentaire pour .map()
export function dtoToNoteWithoutUser(dto: NoteDto): Note {
  return dtoToNote(dto, undefined)
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
