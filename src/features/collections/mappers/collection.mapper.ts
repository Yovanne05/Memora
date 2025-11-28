import type { Collection } from "../models/collection.model"
import type { CollectionDto } from "../dtos/collection.dto"

export function dtoToCollection(dto: CollectionDto): Collection {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    name: dto.name,
    description: dto.description ?? null,
    visibility: dto.visibility ?? "private",
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}
