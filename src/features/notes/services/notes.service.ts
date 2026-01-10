import type {
  NoteCreateDto,
  NoteDto,
  NoteUpdateDto,
  NotesListDto,
} from '../dtos/note.dto'
import {
  dtoToNote,
  toNoteCreateDto,
  toNoteUpdateDto,
} from '../mappers/note.mapper'
import type { NoteCreate, NoteUpdate } from '../models/note.model'
import type { NotesFilters } from '../types/note-query'
import type { PaginatedNotes } from '../types/paginated-note'
import type { INotesService } from './notes.service.interface'
import { httpClient, type HttpClient } from '@/lib/http-client'

export function createNotesService(
  client: HttpClient = httpClient
): INotesService {
  return {
    async list(params?: NotesFilters): Promise<PaginatedNotes> {
      const data = await client.get<NotesListDto>('/notes', {
        params: mapNotesFilters(params),
      })
      const items = Array.isArray(data) ? data : (data?.items ?? [])
      const total = Array.isArray(data)
        ? items.length
        : (data?.total ?? items.length)

      return {
        items: items.map(dtoToNote),
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
      return dtoToNote(dto)
    },

    async create(payload: NoteCreate) {
      const dto = await client.post<NoteDto, NoteCreateDto>(
        '/notes',
        toNoteCreateDto(payload)
      )
      return dtoToNote(dto)
    },

    async update(id: string, payload: NoteUpdate) {
      const dto = await client.patch<NoteDto, NoteUpdateDto>(
        `/notes/${id}`,
        toNoteUpdateDto(payload)
      )
      return dtoToNote(dto)
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

function mapNotesFilters(params?: NotesFilters): NotesFilters | undefined {
  if (!params) return params

  const {
    ownerId,
    collectionId,
    sharedWithUserId,
    titleContains,
    contentContains,
    isFavorite,
    sortBy,
    sortDir,
    tagIds,
    ...rest
  } = params

  const mapped: NotesFilters = { ...rest }

  if (ownerId) mapped.owner_id = ownerId
  if (collectionId) mapped.collection_id = collectionId
  if (sharedWithUserId) mapped.shared_with_user_id = sharedWithUserId
  if (titleContains) mapped.title_contains = titleContains
  if (contentContains) mapped.content_contains = contentContains
  if (typeof isFavorite === 'boolean') mapped.is_favorite = isFavorite
  if (sortBy) mapped.sort_by = sortBy
  if (sortDir) mapped.sort_dir = sortDir
  if (tagIds) mapped.tags = tagIds

  return mapped
}
