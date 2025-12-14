import { collectionsService } from '@/features/collections/services/collections.service'
import { notesService } from '@/features/notes/services/notes.service'
import type { ICollectionsService } from '@/features/collections/services/collections.service.interface'
import type { INotesService } from '@/features/notes/services/notes.service.interface'
import type {
  SearchParams,
  SearchResult,
  PaginatedSearchResponse,
} from '../types/search.types'

export interface ISearchService {
  search(params: SearchParams): Promise<PaginatedSearchResponse>
}

export function createSearchService(
  collectionsApi: ICollectionsService = collectionsService,
  notesApi: INotesService = notesService
): ISearchService {
  return {
    async search(params: SearchParams): Promise<PaginatedSearchResponse> {
      const results: SearchResult[] = []
      let totalCount = 0

      const searchType = params.type || 'all'
      const isSearchingCollections = searchType === 'all' || searchType === 'collection'
      const isSearchingNotes = searchType === 'all' || searchType === 'note'

      const commonParams = {
        limit: params.limit,
        offset: params.offset,
        visibility: 'public' as const,
        tags: params.tags?.length ? params.tags.join(',') : undefined,
      }

      if (isSearchingCollections) {
        const collectionParams = {
          ...commonParams,
          titleContains: params.query,
          sortBy: params.sortBy === 'alphabetical' ? ('title' as const) : ('created_at' as const),
          sortDir: params.sortDir || ('desc' as const),
        }

        try {
          const collections = await collectionsApi.list(collectionParams)
          results.push(...collections.map(item => ({ type: 'collection' as const, item })))
          totalCount += collections.length
        } catch (error) {
          console.error('Error fetching collections:', error)
        }
      }

      if (isSearchingNotes) {
        const noteParams = {
          ...commonParams,
          titleContains: params.query,
          contentContains: params.query,
          sortBy: params.sortBy === 'alphabetical' ? ('title' as const) : ('created_at' as const),
          sortDir: params.sortDir || ('desc' as const),
        }

        try {
          const paginatedNotes = await notesApi.list(noteParams)
          results.push(...paginatedNotes.items.map(item => ({ type: 'note' as const, item })))
          totalCount += paginatedNotes.total
        } catch (error) {
          console.error('Error fetching notes:', error)
        }
      }

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
