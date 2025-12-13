import type { NoteCreateDto, NoteDto, NoteUpdateDto, NotesListDto } from "../dtos/note.dto"
import { dtoToNote, toNoteCreateDto, toNoteUpdateDto } from "../mappers/note.mapper"
import type { NoteCreate, NoteUpdate } from "../models/note.model"
import type { PaginatedNotes, NotesListParams } from "../types/paginated-note"
import type { INotesService } from "./notes.service.interface"
import { httpClient, type HttpClient } from "@/lib/http-client"

export function createNotesService(client: HttpClient = httpClient): INotesService {
  return {
    async list(params?: NotesListParams): Promise<PaginatedNotes> {
      const data = await client.get<NotesListDto>("/notes", { params })
      const items = Array.isArray(data) ? data : data?.items ?? []
      const total = Array.isArray(data) ? items.length : data?.total ?? items.length

      return {
        items: items.map(dtoToNote),
        total,
        page: params?.offset && params?.limit ? Math.floor(params.offset / params.limit) : 0,
        limit: params?.limit,
      }
    },

    async get(id: string) {
      const dto = await client.get<NoteDto>(`/notes/${id}`)
      return dtoToNote(dto)
    },

    async create(payload: NoteCreate) {
      const dto = await client.post<NoteDto, NoteCreateDto>("/notes", toNoteCreateDto(payload))
      return dtoToNote(dto)
    },

    async update(id: string, payload: NoteUpdate) {
      const dto = await client.patch<NoteDto, NoteUpdateDto>(`/notes/${id}`, toNoteUpdateDto(payload))
      return dtoToNote(dto)
    },

    async remove(id: string) {
      await client.delete<void>(`/notes/${id}`)
    },
  }
}

export const notesService = createNotesService()
export type { INotesService as NotesService } from "./notes.service.interface"

