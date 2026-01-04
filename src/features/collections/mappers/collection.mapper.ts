import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
} from "../models/collection.model"
import type {
  CollectionDto,
  CollectionCreateDto,
  CollectionUpdateDto,
} from "../dtos/collection.dto"
import { dtoToNote } from "@/features/notes/mappers/note.mapper"

export function dtoToCollection(dto: CollectionDto): Collection {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    name: dto.name,
    description: dto.description ?? null,
    visibility: dto.visibility ?? "private",
      isFavorite: dto.is_favorite ?? false,
    tags: dto.tags ?? [],
    notes: dto.notes.map(dtoToNote),
    nodes: dto.nodes ?? [],
    edges: dto.edges ?? [],
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export function toCollectionCreateDto(payload: CollectionCreate): CollectionCreateDto {
  return {
    owner_id: payload.ownerId,
    name: payload.name,
    description: payload.description ?? null,
    visibility: payload.visibility ?? "private",
    tags: payload.tags,
  }
}

export function toCollectionUpdateDto(payload: CollectionUpdate): CollectionUpdateDto {
  return {
    name: payload.name,
    description: payload.description,
    visibility: payload.visibility,
    tags: payload.tags,
  }
}
