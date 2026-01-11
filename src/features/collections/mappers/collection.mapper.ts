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
  // 1. Si user_permission existe, l'utiliser
  if (dto.user_permission) {
    return dto.user_permission
  }

  // 2. Sinon, chercher dans user_access
  if (dto.user_access && currentUserId) {
    const userAccess = dto.user_access.find(
      (access) => access.user_id === currentUserId
    )
    if (userAccess) {
      return userAccess.permission
    }
  }

  return null
}

export function dtoToCollection(
  dto: CollectionDto,
  currentUserId?: string
): Collection {
  // Récupérer la permission de l'utilisateur sur la collection
  const collectionPermission = getCurrentUserCollectionPermission(
    dto,
    currentUserId
  )

  // Injecter la permission de la collection dans les notes pour l'héritage
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

// Version sans paramètre supplémentaire pour .map()
export function dtoToCollectionWithoutUser(dto: CollectionDto): Collection {
  return dtoToCollection(dto, undefined)
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
