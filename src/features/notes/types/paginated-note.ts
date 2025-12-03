import type { Note } from "../models/note.model"
import type { NotesFilters } from "./note-query"

export interface PaginatedNotes {
  items: Note[]
  total: number
  page?: number
  limit?: number
}

export interface NotesListParams extends NotesFilters {
  limit?: number
  offset?: number
}

