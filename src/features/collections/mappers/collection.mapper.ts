import { calculateUserPermission } from '@/lib/permissions'
import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
  CollectionPermission,
} from '../models/collection.model'
import type {
  CollectionDto,
  CollectionCreateDto,
  CollectionUpdateDto,
} from '../dtos/collection.dto'
import { dtoToNoteWithoutUser } from '@/features/notes/mappers/note.mapper'

function getCurrentUserCollectionPermission(
  dto: CollectionDto,
  currentUserId?: string
): CollectionPermission | null {
  return calculateUserPermission({
    userId: currentUserId,
    userPermission: dto.user_permission,
    userAccess: dto.user_access?.map((access) => ({
      userId: access.user_id,
      permission: access.permission,
    })),
    parentPermission: null,
  })
}

export function dtoToCollection(
  dto: CollectionDto,
  currentUserId?: string
): Collection {
  const collectionPermission = getCurrentUserCollectionPermission(
    dto,
    currentUserId
  )

  const notesWithCollectionPermission = dto.notes.map((noteDto) => ({
    ...noteDto,
    collection_permission:
      noteDto.collection_permission ?? collectionPermission,
  }))

  return {
    id: dto.id,
    ownerId: dto.owner_id,
    name: dto.name,
    description: dto.description ?? null,
    visibility: dto.visibility ?? 'private',
    isFavorite: dto.is_favorite ?? false,
    tags: dto.tags ?? [],
    notes: notesWithCollectionPermission.map(dtoToNoteWithoutUser),
    nodes: dto.nodes ?? [],
    edges: dto.edges ?? [],
    userPermission: collectionPermission,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export function dtoToCollectionWithoutUser(dto: CollectionDto): Collection {
  return dtoToCollection(dto)
}

export function toCollectionCreateDto(
  payload: CollectionCreate
): CollectionCreateDto {
  return {
    owner_id: payload.ownerId,
    name: payload.name,
    description: payload.description ?? null,
    visibility: payload.visibility ?? 'private',
    tags: payload.tags,
  }
}

export function toCollectionUpdateDto(
  payload: CollectionUpdate
): CollectionUpdateDto {
  return {
    name: payload.name,
    description: payload.description,
    visibility: payload.visibility,
    tags: payload.tags,
  }
}
