import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createNotesService } from '@/features/notes/services/notes.service'
import type { HttpClient } from '@/lib/http-client'
import type { NoteDto } from '@/features/notes/dtos/note.dto'
import type { NoteCreate, NoteUpdate } from '@/features/notes/models/note.model'

const mockHttpClient: HttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  // @ts-expect-error - Test mock
  put: vi.fn(),
}

describe('notes.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should fetch and transform array response', async () => {
      const mockData: NoteDto[] = [
        // @ts-expect-error - Test mock
        {
          id: '1',
          collection_id: null,
          owner_id: 'user-1',
          owner_username: 'john',
          title: 'Note 1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockData)

      const service = createNotesService(mockHttpClient)
      const result = await service.list()

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.items[0].title).toBe('Note 1')
    })

    it('should fetch and transform paginated response', async () => {
      const mockData = {
        items: [
          {
            id: '1',
            collection_id: null,
            owner_id: 'user-1',
            owner_username: 'john',
            title: 'Note 1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 10,
      }
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockData)

      const service = createNotesService(mockHttpClient)
      const result = await service.list()

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(10)
    })

    it('should transform filter keys to snake_case', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue([])

      const service = createNotesService(mockHttpClient)
      await service.list({ collectionId: 'col-1', isFavorite: true })

      expect(mockHttpClient.get).toHaveBeenCalledWith('/notes', {
        params: { collection_id: 'col-1', is_favorite: true },
      })
    })

    it('should calculate offset correctly', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue([])

      const service = createNotesService(mockHttpClient)
      const result = await service.list({ offset: 20, limit: 10 })

      expect(result.offset).toBe(2)
      expect(result.limit).toBe(10)
    })

    it('should handle empty response', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue([])

      const service = createNotesService(mockHttpClient)
      const result = await service.list()

      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('get', () => {
    it('should fetch single note', async () => {
      // @ts-expect-error - Test mock
      const mockDto: NoteDto = {
        id: '1',
        collection_id: null,
        owner_id: 'user-1',
        owner_username: 'john',
        title: 'Test Note',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockDto)

      const service = createNotesService(mockHttpClient)
      const result = await service.get('1')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/notes/1')
      expect(result.id).toBe('1')
      expect(result.title).toBe('Test Note')
    })
  })

  describe('create', () => {
    it('should create note with correct payload', async () => {
      const payload: NoteCreate = {
        ownerId: 'user-1',
        title: 'New Note',
        content: 'Content',
        collectionId: 'col-1',
        tags: ['tag1'],
        visibility: 'public',
      }
      // @ts-expect-error - Test mock
      const mockDto: NoteDto = {
        id: '1',
        collection_id: 'col-1',
        owner_id: 'user-1',
        owner_username: 'john',
        title: 'New Note',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockDto)

      const service = createNotesService(mockHttpClient)
      const result = await service.create(payload)

      expect(mockHttpClient.post).toHaveBeenCalledWith('/notes', {
        owner_id: 'user-1',
        title: 'New Note',
        collection_id: 'col-1',
        tags: ['tag1'],
        visibility: 'public',
      })
      expect(result.title).toBe('New Note')
    })
  })

  describe('update', () => {
    it('should update note with partial payload', async () => {
      const payload: NoteUpdate = {
        title: 'Updated Title',
        visibility: 'private',
      }
      // @ts-expect-error - Test mock
      const mockDto: NoteDto = {
        id: '1',
        collection_id: null,
        owner_id: 'user-1',
        owner_username: 'john',
        title: 'Updated Title',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }
      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockDto)

      const service = createNotesService(mockHttpClient)
      const result = await service.update('1', payload)

      expect(mockHttpClient.patch).toHaveBeenCalledWith('/notes/1', {
        title: 'Updated Title',
        visibility: 'private',
      })
      expect(result.title).toBe('Updated Title')
    })
  })

  describe('remove', () => {
    it('should delete note by id', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined)

      const service = createNotesService(mockHttpClient)
      await service.remove('1')

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/notes/1')
    })
  })

  describe('addFavorite', () => {
    it('should add note to favorites', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue(undefined)

      const service = createNotesService(mockHttpClient)
      await service.addFavorite('1')

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/notes/1/favorites',
        undefined
      )
    })
  })

  describe('removeFavorite', () => {
    it('should remove note from favorites', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined)

      const service = createNotesService(mockHttpClient)
      await service.removeFavorite('1')

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/notes/1/favorites')
    })
  })
})
