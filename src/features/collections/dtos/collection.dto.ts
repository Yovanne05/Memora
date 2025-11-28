export type CollectionVisibilityDto = "private" | "public"

export interface CollectionDto {
  id: string
  owner_id: string
  name: string
  description?: string | null
  visibility?: CollectionVisibilityDto
  created_at: string
  updated_at: string
}

export type CollectionsListDto = CollectionDto[] | { items: CollectionDto[] }
