import { SharePermission } from "../dtos/note-share.dto";

export interface NoteShare {
  noteId: string;
  userId: string;
  permission: SharePermission;
  createdAt: Date;
}

export interface NoteShareCreate {
  userId: string;
  permission: SharePermission;
}

export interface NoteShareUpdate {
  permission: SharePermission;
}
