import { collectionsService } from '@/features/collections/services/collections.service'
import { notesService } from '@/features/notes/services/notes.service'
import type { ICollectionsService } from '@/features/collections/services/collections.service.interface'
import type { INotesService } from '@/features/notes/services/notes.service.interface'
import type {
  SearchResult,
  PaginatedSearchResponse,
} from '../types/search.types'
import type { SearchFilters } from '../types/search-query'
import { logger } from '@/lib/logger'

export interface ISearchService {
  search(params: SearchFilters): Promise<PaginatedSearchResponse>
}

export function createSearchService(
  collectionsApi: ICollectionsService = collectionsService,
  notesApi: INotesService = notesService
): ISearchService {
  return {
    async search(params: SearchFilters): Promise<PaginatedSearchResponse> {
      const results: SearchResult[] = []
      let totalCount = 0

      const searchType = params.type ?? 'all'
      const isSearchingCollections =
        searchType === 'all' || searchType === 'collection'
      const isSearchingNotes = searchType === 'all' || searchType === 'note'

      const commonParams = {
        includePublic: true,
        limit: params.limit,
        offset: params.offset,
        tags: params.tags?.length ? params.tags.join(',') : undefined,
      }

      if (isSearchingCollections) {
        const collectionParams = {
          ...commonParams,
          titleContains: params.query,
          sortBy:
            params.sortBy === 'alphabetical'
              ? ('title' as const)
              : ('created_at' as const),
          sortDir: params.sortDir ?? ('desc' as const),
        }

        try {
          const collections = await collectionsApi.list(collectionParams)
          results.push(
            ...collections.items.map((item) => ({
              type: 'collection' as const,
              item,
            }))
          )
          totalCount += collections.total
        } catch (error) {
          logger.error('Error fetching collections:', error)
        }
      }

      if (isSearchingNotes) {
        const noteParams = {
          ...commonParams,
          titleContains: params.query,
          contentContains: params.query,
          sortBy:
            params.sortBy === 'alphabetical'
              ? ('title' as const)
              : ('created_at' as const),
          sortDir: params.sortDir ?? ('desc' as const),
        }

        try {
          const paginatedNotes = await notesApi.list(noteParams)
          results.push(
            ...paginatedNotes.items.map((item) => ({
              type: 'note' as const,
              item,
            }))
          )
          totalCount += paginatedNotes.total
        } catch (error) {
          logger.error('Error fetching notes:', error)
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
        items: results,
        total: totalCount,
        offset:
          params?.offset && params?.limit
            ? Math.floor(params.offset / params.limit)
            : 0,
        limit: params.limit ?? 50,
      }
    },
  }
}

export const searchService = createSearchService()
