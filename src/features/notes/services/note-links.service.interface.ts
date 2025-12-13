import type { NoteLink, CreateNoteLink } from "../models/note-link.model"

export interface INoteLinksService {
  list(noteId: string): Promise<NoteLink[]>
  create(noteId: string, payload: CreateNoteLink): Promise<NoteLink>
  remove(noteId: string, linkedNoteId: string): Promise<void>
}
