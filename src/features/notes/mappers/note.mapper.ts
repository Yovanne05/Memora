import type { NoteCreateDto, NoteDto, NoteUpdateDto } from "../dtos/note.dto"
import type { Note, NoteCreate, NoteUpdate } from "../models/note.model"


export function dtoToNote(dto: NoteDto): Note {
  return {
    id: dto.id,
    collectionId: dto.collection_id,
    ownerId: dto.owner_id,
    title: dto.title,
    content: dto.content,
    visibility: dto.visibility ?? "private",
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
    visibility: payload.visibility ?? "private",
  }
}

export function toNoteUpdateDto(payload: NoteUpdate): NoteUpdateDto {
  return {
    collection_id: payload.collectionId,
    title: payload.title,
    content: payload.content,
    visibility: payload.visibility,
  }
}
