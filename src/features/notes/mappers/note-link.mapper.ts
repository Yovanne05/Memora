import type { CreateNoteLinkDto, NoteLinkDto } from "../dtos/note-link.dto"
import type { NoteLink, CreateNoteLink } from "../models/note-link.model"

export function dtoToNoteLink(dto: NoteLinkDto): NoteLink {
  return {
    noteId: dto.note_id,
    linkedNoteId: dto.linked_note_id,
    createdAt: dto.created_at,
  }
}

export function toCreateNoteLinkDto(payload: CreateNoteLink): CreateNoteLinkDto {
  return {
    linked_note_id: payload.linkedNoteId,
  }
}
