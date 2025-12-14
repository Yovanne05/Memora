import type { Collection } from '@/features/collections/models/collection.model'
import type { Note } from '@/features/notes/models/note.model'

export type SearchResultType = 'collection' | 'note'

export interface SearchResult {
  type: SearchResultType
  item: Collection | Note
}

export interface SearchFilters {
  query?: string
  tags?: string[]
  type?: SearchResultType | 'all'
  sortBy?: 'relevance' | 'date' | 'alphabetical'
  sortDir?: 'asc' | 'desc'
}

export interface SearchParams extends SearchFilters {
  limit: number
  offset: number
}

export interface SearchResponse {
  collections: Collection[]
  notes: Note[]
  total: number
}

export interface PaginatedSearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
}
