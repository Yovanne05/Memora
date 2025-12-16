import type { PaginatedResponse } from "@/types/pagination"
import type { Note } from "../models/note.model"

export type PaginatedNotes = PaginatedResponse<Note>

