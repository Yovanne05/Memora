import {
  dtoToNoteLink,
  toCreateNoteLinkDto,
} from "../mappers/note-link.mapper"
import { httpClient, type HttpClient } from "@/lib/http-client"
import type { INoteLinksService } from "./note-links.service.interface"
import type { CreateNoteLink } from "../models/note-link.model"
import type { CreateNoteLinkDto, NoteLinkDto, PaginatedNoteLinksDto } from "../dtos/note-link.dto"

export function createNoteLinksService(client: HttpClient = httpClient): INoteLinksService {
  return {
    async list(noteId: string) {
      const data = await client.get<PaginatedNoteLinksDto>(`/notes/${noteId}`)
      const items = data?.items ?? []
      return items.map(dtoToNoteLink)
    },
    async create(noteId: string, payload: CreateNoteLink) {
      const dto = await client.post<NoteLinkDto, CreateNoteLinkDto>(
        `/notes/${noteId}/links`,
        toCreateNoteLinkDto(payload)
      )
      return dtoToNoteLink(dto)
    },
    async remove(noteId: string, linkedNoteId: string) {
      await client.delete<void>(`/notes/${noteId}/links/${linkedNoteId}`)
    },
  }
}

export const noteLinksService = createNoteLinksService()
export type { INoteLinksService as NoteLinksService } from "./note-links.service.interface"
