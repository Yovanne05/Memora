export type NoteVisibility = "private" | "public"
export type NotePermission = "read" | "write" | "owner"

export interface Note {
  id: string
  collectionId: string | null
  collectionName: string | null
  ownerId: string
  ownerUsername: string
  title: string
  isFavorite?: boolean
  tags: string[]
  visibility: NoteVisibility
  userPermission?: NotePermission | null
  createdAt: string
  updatedAt: string
}

export interface NoteCreate {
  collectionId?: string | null
  ownerId: string
  title: string
  content: string
  visibility?: NoteVisibility
  tags?: string[]
}

export interface NoteUpdate {
  collectionId?: string | null
  title?: string
  content?: string
  visibility?: NoteVisibility
  tags?: string[]
}
