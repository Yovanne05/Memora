export type CollectionVisibility = "private" | "public"

export interface Collection {
  id: string
  ownerId: string
  name: string
  description?: string | null
  visibility: CollectionVisibility
  createdAt: string
  updatedAt: string
}

export interface CollectionCreatePayload {
  ownerId: string
  name: string
  description?: string | null
  visibility?: CollectionVisibility
}

export interface CollectionUpdatePayload {
  name?: string
  description?: string | null
  visibility?: CollectionVisibility
}
