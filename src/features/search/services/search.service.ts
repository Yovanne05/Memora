import { httpClient, type HttpClient } from '@/lib/http-client'
import { dtoToCollection } from '@/features/collections/mappers/collection.mapper'
import { dtoToNote } from '@/features/notes/mappers/note.mapper'
import type { CollectionDto } from '@/features/collections/dtos/collection.dto'
import type { NoteDto } from '@/features/notes/dtos/note.dto'
import type {
  SearchParams,
  SearchResult,
  PaginatedSearchResponse,
} from '../types/search.types'

export interface ISearchService {
  search(params: SearchParams): Promise<PaginatedSearchResponse>
}

export function createSearchService(client: HttpClient = httpClient): ISearchService {
  return {
    async search(params: SearchParams): Promise<PaginatedSearchResponse> {
      const results: SearchResult[] = []
      let totalCount = 0

      const searchType = params.type || 'all'
      const isSearchingCollections = searchType === 'all' || searchType === 'collection'
      const isSearchingNotes = searchType === 'all' || searchType === 'note'

      // Préparer les paramètres communs (toujours public uniquement)
      const commonParams = {
        limit: params.limit,
        offset: params.offset,
        visibility: 'public',
        tags: params.tags?.length ? params.tags.join(',') : undefined,
      }

      // Recherche dans les collections
      if (isSearchingCollections) {
        const collectionParams = {
          ...commonParams,
          titleContains: params.query,
          sortBy: params.sortBy === 'alphabetical' ? 'title' : params.sortBy === 'date' ? 'created_at' : 'created_at',
          sortDir: params.sortDir || 'desc',
        }

        try {
          const data = await client.get<{ items: CollectionDto[]; total: number }>(
            '/collections',
            { params: collectionParams }
          )
          const items = Array.isArray(data) ? data : data?.items ?? []
          const collections = items.map(dtoToCollection)

          results.push(...collections.map(item => ({ type: 'collection' as const, item })))
          totalCount += Array.isArray(data) ? items.length : data?.total ?? items.length
        } catch (error) {
          console.error('Error fetching collections:', error)
        }
      }

      // Recherche dans les notes
      if (isSearchingNotes) {
        const noteParams = {
          ...commonParams,
          titleContains: params.query,
          contentContains: params.query,
          sortBy: params.sortBy === 'alphabetical' ? 'title' : params.sortBy === 'date' ? 'created_at' : 'created_at',
          sortDir: params.sortDir || 'desc',
        }

        try {
          const data = await client.get<{ items: NoteDto[]; total: number }>(
            '/notes',
            { params: noteParams }
          )
          const items = Array.isArray(data) ? data : data?.items ?? []
          const notes = items.map(dtoToNote)

          results.push(...notes.map(item => ({ type: 'note' as const, item })))
          totalCount += Array.isArray(data) ? items.length : data?.total ?? items.length
        } catch (error) {
          console.error('Error fetching notes:', error)
        }
      }

      // Tri des résultats combinés si nécessaire
      if (searchType === 'all') {
        results.sort((a, b) => {
          const dateA = new Date(a.item.createdAt).getTime()
          const dateB = new Date(b.item.createdAt).getTime()
          return params.sortDir === 'asc' ? dateA - dateB : dateB - dateA
        })
      }

      return {
        results,
        total: totalCount,
        page: params.offset && params.limit ? Math.floor(params.offset / params.limit) : 0,
        limit: params.limit,
      }
    },
  }
}

export const searchService = createSearchService()
