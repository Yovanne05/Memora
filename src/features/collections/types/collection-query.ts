export interface CollectionsFilters {
  ownerId?: string
  sharedWithUserId?: string
  visibility?: "private" | "public"
  titleContains?: string
  ids?: string
  tagIds?: string
  onlyWithNotes?: boolean
  sortBy?: "title" | "created_at" | "updated_at"
  sortDir?: "asc" | "desc"
}