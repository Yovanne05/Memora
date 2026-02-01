import {
  dtoToNoteLink,
  toCreateNoteLinkDto,
} from "../mappers/note-link.mapper"
import { httpClient, type HttpClient } from "@/lib/http-client"
import type { INoteLinksService } from "./note-links.service.interface"
import type { CreateNoteLink } from "../models/note-link.model"
import type { CreateNoteLinkDto, NoteLinkDto, PaginatedNoteLinksDto } from "../dtos/note-link.dto"
import type { NoteLinksFilters } from "../types/note-link-query"
import type { PaginatedNoteLinks } from "../types/paginated-note-link"

export function createNoteLinksService(client: HttpClient = httpClient): INoteLinksService {
  return {
    async list(params?: NoteLinksFilters): Promise<PaginatedNoteLinks> {
      const noteId = params?.noteId
      if (!noteId) {
        return {
          items: [],
          total: 0,
          limit: params?.limit ?? 10,
          offset: params?.offset ?? 0,
        }
      }
      const query = { ...params }
      delete query.noteId
      const data = await client.get<PaginatedNoteLinksDto>(
        `/notes/${noteId}/relations`,
        { params: query }
      )
      return {
        items: (data?.items ?? []).map(dtoToNoteLink),
        total: data?.total ?? 0,
        limit: data?.limit ?? 10,
        offset: data?.offset ?? 0,
      }
    },
    async create(noteId: string, payload: CreateNoteLink) {
      const dto = await client.post<NoteLinkDto, CreateNoteLinkDto>(
        `/notes/${noteId}/relations`,
        toCreateNoteLinkDto(payload)
      )
      return dtoToNoteLink(dto)
    },
    async remove(noteId: string, linkedNoteId: string) {
      await client.delete<void>(`/notes/${noteId}/relations/${linkedNoteId}`)
    },
  }
}

export const noteLinksService = createNoteLinksService()
export type { INoteLinksService as NoteLinksService } from "./note-links.service.interface"
