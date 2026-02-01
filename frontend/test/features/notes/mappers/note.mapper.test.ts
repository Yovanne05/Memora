import { describe, it, expect, vi } from 'vitest'
import {
  dtoToNote,
  dtoToNoteWithoutUser,
  toNoteCreateDto,
  toNoteUpdateDto,
} from '@/features/notes/mappers/note.mapper'
import type { NoteCreate, NoteUpdate } from '@/features/notes/models/note.model'

vi.mock('@/lib/permissions/calculate-permissions', () => ({
  calculateUserPermission: vi.fn((input) => {
    if (!input.userId) return null
    if (input.userPermission) return input.userPermission
    const access = input.userAccess?.find(
      (a: { userId: string; permission: string }) => a.userId === input.userId
    )
    if (access) return access.permission
    return input.parentPermission || null
  }),
}))

describe('note.mapper', () => {
  describe('dtoToNote', () => {
    it('should map all required fields correctly', () => {
      const dto = {
        id: '123',
        collection_id: 'col-456',
        collection_name: 'My Collection',
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test Note',
        content: 'Content',
        is_favorite: true,
        tags: ['tag1', 'tag2'],
        visibility: 'public',
        user_permission: 'write',
        user_access: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto, 'user-1')

      expect(result).toEqual({
        id: '123',
        collectionId: 'col-456',
        collectionName: 'My Collection',
        ownerId: 'owner-789',
        ownerUsername: 'john_doe',
        title: 'Test Note',
        content: 'Content',
        isFavorite: true,
        tags: ['tag1', 'tag2'],
        visibility: 'public',
        userPermission: 'write',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      })
    })

    it('should handle null collection_name', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto)
      expect(result.collectionName).toBeNull()
    })

    it('should default is_favorite to false when undefined', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto)
      expect(result.isFavorite).toBe(false)
    })

    it('should default tags to empty array when undefined', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto)
      expect(result.tags).toEqual([])
    })

    it('should default visibility to private when undefined', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto)
      expect(result.visibility).toBe('private')
    })

    it('should use user_permission when available', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        user_permission: 'owner',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto, 'user-1')
      expect(result.userPermission).toBe('owner')
    })

    it('should use user_access permission when user_permission is null', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        user_access: [
          { user_id: 'user-1', permission: 'read' },
          { user_id: 'user-2', permission: 'write' },
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto, 'user-1')
      expect(result.userPermission).toBe('read')
    })

    it('should fallback to collection_permission', () => {
      const dto = {
        id: '123',
        collection_id: 'col-1',
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        collection_permission: 'write',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto, 'user-1')
      expect(result.userPermission).toBe('write')
    })

    it('should return null permission when no userId provided', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        user_permission: 'write',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNote(dto)
      expect(result.userPermission).toBeNull()
    })
  })

  describe('dtoToNoteWithoutUser', () => {
    it('should call dtoToNote with undefined userId', () => {
      const dto = {
        id: '123',
        collection_id: null,
        owner_id: 'owner-789',
        owner_username: 'john_doe',
        title: 'Test',
        user_permission: 'write',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      // @ts-expect-error - Test mock
      const result = dtoToNoteWithoutUser(dto)
      expect(result.userPermission).toBeNull()
    })
  })

  describe('toNoteCreateDto', () => {
    it('should map create payload correctly', () => {
      const payload: NoteCreate = {
        collectionId: 'col-1',
        ownerId: 'owner-1',
        title: 'New Note',
        content: 'Content',
        tags: ['test'],
        visibility: 'public',
      }

      const result = toNoteCreateDto(payload)

      expect(result).toEqual({
        collection_id: 'col-1',
        owner_id: 'owner-1',
        title: 'New Note',
        tags: ['test'],
        visibility: 'public',
      })
    })

    it('should default collectionId to null', () => {
      const payload: NoteCreate = {
        ownerId: 'owner-1',
        title: 'New Note',
        content: 'Content',
      }

      const result = toNoteCreateDto(payload)
      expect(result.collection_id).toBeNull()
    })

    it('should default visibility to private', () => {
      const payload: NoteCreate = {
        ownerId: 'owner-1',
        title: 'New Note',
        content: 'Content',
      }

      const result = toNoteCreateDto(payload)
      expect(result.visibility).toBe('private')
    })
  })

  describe('toNoteUpdateDto', () => {
    it('should map update payload correctly', () => {
      const payload: NoteUpdate = {
        collectionId: 'col-2',
        title: 'Updated Note',
        tags: ['updated'],
        visibility: 'private',
      }

      const result = toNoteUpdateDto(payload)

      expect(result).toEqual({
        collection_id: 'col-2',
        title: 'Updated Note',
        tags: ['updated'],
        visibility: 'private',
      })
    })

    it('should handle partial updates', () => {
      const payload: NoteUpdate = {
        title: 'Just Title',
      }

      const result = toNoteUpdateDto(payload)
      expect(result.title).toBe('Just Title')
      expect(result.collection_id).toBeUndefined()
    })
  })
})
