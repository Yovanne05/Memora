import type { HttpClient } from "@/lib/http-client";
import { httpClient } from "@/lib/http-client";
import type {
  NoteShareCreateDto,
  NoteShareDto,
  NoteShareListDto,
  NoteShareUpdateDto,
} from "../dtos/note-share.dto";
import {
  dtoToNoteShare,
  noteShareCreateToDto,
  noteShareUpdateToDto,
} from "../mappers/note-share.mapper";
import type {
  NoteShare,
  NoteShareCreate,
  NoteShareUpdate,
} from "../models/note-share.model";
import type { INoteSharesService } from "./note-shares.service.interface";

export function createNoteSharesService(
  client: HttpClient = httpClient
): INoteSharesService {
  return {
    async list(noteId: string): Promise<NoteShare[]> {
      const data = await client.get<NoteShareListDto>("/note-shares", {
        params: { note_id: noteId },
      });
      return data.items.map(dtoToNoteShare);
    },

    async create(
      noteId: string,
      payload: NoteShareCreate
    ): Promise<NoteShare> {
      const dto = await client.post<NoteShareDto, NoteShareCreateDto>(
        `/note-shares/${noteId}`,
        noteShareCreateToDto(payload)
      );
      return dtoToNoteShare(dto);
    },

    async update(
      noteId: string,
      userId: string,
      payload: NoteShareUpdate
    ): Promise<NoteShare> {
      const dto = await client.patch<NoteShareDto, NoteShareUpdateDto>(
        `/note-shares/${noteId}/shares/${userId}`,
        noteShareUpdateToDto(payload)
      );
      return dtoToNoteShare(dto);
    },

    async remove(noteId: string, userId: string): Promise<void> {
      await client.delete<void>(`/note-shares/${noteId}/shares/${userId}`);
    },
  };
}

export const noteSharesService = createNoteSharesService();
export type { INoteSharesService as NoteSharesService } from "./note-shares.service.interface";
