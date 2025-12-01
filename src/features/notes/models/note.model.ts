export type NoteVisibility = "private" | "public"

export interface Note {
  id: string
  collectionId: string | null
  ownerId: string
  title: string
  content: string
  visibility: NoteVisibility
  createdAt: string
  updatedAt: string
}

export interface NoteCreate {
  collectionId?: string | null
  ownerId: string
  title: string
  content: string
  visibility?: NoteVisibility
}

export interface NoteUpdate {
  collectionId?: string | null
  title?: string
  content?: string
  visibility?: NoteVisibility
}

export interface PaginatedNotes {
    items: Note[];
    total: number;
}
