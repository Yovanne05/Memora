import type { NoteCreateDto, NoteDto, NoteUpdateDto } from "../dtos/note.dto"
import type { Note, NoteCreate, NoteUpdate } from "../models/note.model"


export function dtoToNote(dto: NoteDto): Note {
  return {
    id: dto.id,
    collectionId: dto.collection_id,
    collectionName: dto.collection_name ?? null,
    ownerId: dto.owner_id,
    ownerUsername: dto.owner_username,
    title: dto.title,
    isFavorite: dto.is_favorite ?? false,
    content: dto.content,
    tags: dto.tags ?? [],
    visibility: dto.visibility ?? "private",
    userPermission: dto.user_permission ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export function toNoteCreateDto(payload: NoteCreate): NoteCreateDto {
  return {
    collection_id: payload.collectionId ?? null,
    owner_id: payload.ownerId,
    title: payload.title,
    content: payload.content,
    tags: payload.tags,
    visibility: payload.visibility ?? "private",
  }
}

export function toNoteUpdateDto(payload: NoteUpdate): NoteUpdateDto {
  return {
    collection_id: payload.collectionId,
    title: payload.title,
    content: payload.content,
    tags: payload.tags,
    visibility: payload.visibility,
  }
}
