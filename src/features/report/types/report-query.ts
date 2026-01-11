export interface ReportsFilters {
  targetType?: string
  target_type?: string
  reporterId?: string
  reporter_id?: string
  noteId?: string
  note_id?: string
  collectionId?: string
  collection_id?: string
  status?: string
  sortBy?: string
  sort_by?: string
  sortDir?: 'asc' | 'desc'
  sort_dir?: 'asc' | 'desc'
  offset?: number
  limit?: number
  [key: string]: string | number | undefined
}
