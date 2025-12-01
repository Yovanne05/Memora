import type { Note } from "@/features/notes/models/note.model"
export type CollectionVisibility = "private" | "public"

export interface Collection {
  id: string
  ownerId: string
  name: string
  description?: string | null
  visibility: CollectionVisibility
  notes: Note[]
  createdAt: string
  updatedAt: string
}

export interface CollectionCreate {
  ownerId: string
  name: string
  description?: string | null
  visibility?: CollectionVisibility
}

export interface CollectionUpdate {
  name?: string
  description?: string | null
  visibility?: CollectionVisibility
}
