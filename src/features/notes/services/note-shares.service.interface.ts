import type {
  NoteShare,
  NoteShareCreate,
  NoteShareUpdate,
} from "../models/note-share.model";

export interface INoteSharesService {
  list(noteId: string): Promise<NoteShare[]>;
  listByUser(userId: string): Promise<NoteShare[]>;
  create(noteId: string, payload: NoteShareCreate): Promise<NoteShare>;
  update(
    noteId: string,
    userId: string,
    payload: NoteShareUpdate
  ): Promise<NoteShare>;
  remove(noteId: string, userId: string): Promise<void>;
}
