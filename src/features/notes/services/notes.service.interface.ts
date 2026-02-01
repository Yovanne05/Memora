import type { Note, NoteCreate, NoteUpdate } from "../models/note.model"
import type { NotesFilters } from "../types/note-query"
import type { PaginatedNotes } from "../types/paginated-note"

export interface INotesService {
  list(params?: NotesFilters): Promise<PaginatedNotes>
  get(id: string): Promise<Note>
  create(payload: NoteCreate): Promise<Note>
  update(id: string, payload: NoteUpdate): Promise<Note>
  remove(id: string): Promise<void>
  addFavorite(id: string): Promise<void>
  removeFavorite(id: string): Promise<void>
}

