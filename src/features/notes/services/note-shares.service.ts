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
import { notesService } from "./notes.service";

export function createNoteSharesService(
  client: HttpClient = httpClient
): INoteSharesService {
  return {
    async list(noteId: string): Promise<NoteShare[]> {
      const data = await client.get<NoteShareListDto>(
        `/notes/${noteId}/shares`
      );
      return data.items.map(dtoToNoteShare);
    },
    async listByUser(userId: string): Promise<NoteShare[]> {
      if (!userId) {
        return []
      }
      const data = await notesService.list({
        limit: 200,
        offset: 0,
        sharedWithUserId: userId,
      });
      return data.items
        .filter((note) => note.ownerId !== userId)
        .map((note) => ({
          noteId: note.id,
          userId,
          permission: note.userPermission ?? "read",
          createdAt: new Date(note.createdAt),
        }));
    },

    async create(
      noteId: string,
      payload: NoteShareCreate
    ): Promise<NoteShare> {
      const dto = await client.post<NoteShareDto, NoteShareCreateDto>(
        `/notes/${noteId}/shares`,
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
        `/notes/${noteId}/shares/${userId}`,
        noteShareUpdateToDto(payload)
      );
      return dtoToNoteShare(dto);
    },

    async remove(noteId: string, userId: string): Promise<void> {
      await client.delete<void>(`/notes/${noteId}/shares/${userId}`);
    },
  };
}

export const noteSharesService = createNoteSharesService();
export type { INoteSharesService as NoteSharesService } from "./note-shares.service.interface";
