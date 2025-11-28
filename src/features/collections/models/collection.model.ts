export type CollectionVisibility = "private" | "public"

export interface Collection {
  id: string
  ownerId: string
  name: string
  description?: string | null
  visibility: CollectionVisibility
  createdAt: string
  updatedAt: string
  notesCount: number
  collaboratorsCount: number
}

export interface CollectionCreatePayload {
  name: string
  description?: string | null
  visibility?: CollectionVisibility
}

export interface CollectionUpdatePayload {
  name?: string
  description?: string | null
  visibility?: CollectionVisibility
}
