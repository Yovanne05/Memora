import type { Note, NoteCreate, NoteUpdate } from "../models/note.model"
import type { PaginatedNotes, NotesListParams } from "../types/paginated-note"

export interface INotesService {
  list(params?: NotesListParams): Promise<PaginatedNotes>
  get(id: string): Promise<Note>
  create(payload: NoteCreate): Promise<Note>
  update(id: string, payload: NoteUpdate): Promise<Note>
  remove(id: string): Promise<void>
}

