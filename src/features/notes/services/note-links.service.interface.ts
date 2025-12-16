import type { NoteLink, CreateNoteLink } from "../models/note-link.model"
import type { NoteLinksFilters } from "../types/note-link-query"
import type { PaginatedNoteLinks } from "../types/paginated-note-link"

export interface INoteLinksService {
  list(params?: NoteLinksFilters): Promise<PaginatedNoteLinks>
  create(noteId: string, payload: CreateNoteLink): Promise<NoteLink>
  remove(noteId: string, linkedNoteId: string): Promise<void>
}
