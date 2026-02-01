import type {
  NoteCreateDto,
  NoteDto,
  NoteUpdateDto,
  NotesListDto,
} from '../dtos/note.dto'
import {
  dtoToNoteWithoutUser,
  toNoteCreateDto,
  toNoteUpdateDto,
} from '../mappers/note.mapper'
import type { NoteCreate, NoteUpdate } from '../models/note.model'
import type { NotesFilters } from '../types/note-query'
import type { PaginatedNotes } from '../types/paginated-note'
import type { INotesService } from './notes.service.interface'
import { httpClient, type HttpClient } from '@/lib/http-client'
import { transformFilterKeys } from '@/lib/services/resource-service-utils'

export function createNotesService(
  client: HttpClient = httpClient
): INotesService {
  return {
    async list(params?: NotesFilters): Promise<PaginatedNotes> {
      const data = await client.get<NotesListDto>('/notes', {
        params: params
          ? (transformFilterKeys(params) as Record<
              string,
              string | number | boolean | string[]
            >)
          : undefined,
      })
      const items = Array.isArray(data) ? data : (data?.items ?? [])
      const total = Array.isArray(data)
        ? items.length
        : (data?.total ?? items.length)

      return {
        items: items.map(dtoToNoteWithoutUser),
        total,
        offset:
          params?.offset && params?.limit
            ? Math.floor(params.offset / params.limit)
            : 0,
        limit: params?.limit ?? 50,
      }
    },

    async get(id: string) {
      const dto = await client.get<NoteDto>(`/notes/${id}`)
      return dtoToNoteWithoutUser(dto)
    },

    async create(payload: NoteCreate) {
      const dto = await client.post<NoteDto, NoteCreateDto>(
        '/notes',
        toNoteCreateDto(payload)
      )
      return dtoToNoteWithoutUser(dto)
    },

    async update(id: string, payload: NoteUpdate) {
      const dto = await client.patch<NoteDto, NoteUpdateDto>(
        `/notes/${id}`,
        toNoteUpdateDto(payload)
      )
      return dtoToNoteWithoutUser(dto)
    },

    async remove(id: string) {
      await client.delete<void>(`/notes/${id}`)
    },

    async addFavorite(id: string) {
      await client.post<void, never>(
        `/notes/${id}/favorites`,
        undefined as never
      )
    },

    async removeFavorite(id: string) {
      await client.delete<void>(`/notes/${id}/favorites`)
    },
  }
}

export const notesService = createNotesService()
export type { INotesService as NotesService } from './notes.service.interface'
