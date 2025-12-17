import type { Collection } from '@/features/collections/models/collection.model'
import type { Note } from '@/features/notes/models/note.model'
import type { PaginatedResponse } from '@/types/pagination'

export type SearchResultType = 'collection' | 'note'

export interface SearchResult {
  type: SearchResultType
  item: Collection | Note
}
export interface SearchResponse {
  collections: Collection[]
  notes: Note[]
  total: number
}

export type PaginatedSearchResponse = PaginatedResponse<SearchResult>
