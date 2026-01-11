import { describe, it, expect, vi } from 'vitest'
import { dtoToCollection } from '@/features/collections/mappers/collection.mapper'
import type { CollectionDto } from '@/features/collections/dtos/collection.dto'

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

vi.mock('@/features/notes/mappers/note.mapper', () => ({
  dtoToNoteWithoutUser: vi.fn((dto) => ({
    id: dto.id,
    collectionId: dto.collection_id,
    ownerId: dto.owner_id,
    ownerUsername: dto.owner_username,
    title: dto.title,
    content: dto.content ?? null,
    isFavorite: dto.is_favorite ?? false,
    tags: dto.tags ?? [],
    visibility: dto.visibility ?? 'private',
    userPermission: null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  })),
}))

describe('dtoToCollection - default values', () => {
  it('should default isFavorite to false', () => {
    // @ts-expect-error - Test object with minimal properties
    const dto: CollectionDto = {
      id: '123',
      owner_id: 'owner-1',
      name: 'Test',
      notes: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const result = dtoToCollection(dto)
    expect(result.isFavorite).toBe(false)
  })

  it('should default tags to empty array', () => {
    // @ts-expect-error - Test object with minimal properties
    const dto: CollectionDto = {
      id: '123',
      owner_id: 'owner-1',
      name: 'Test',
      notes: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const result = dtoToCollection(dto)
    expect(result.tags).toEqual([])
  })

  it('should default nodes to empty array', () => {
    // @ts-expect-error - Test object with minimal properties
    const dto: CollectionDto = {
      id: '123',
      owner_id: 'owner-1',
      name: 'Test',
      notes: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const result = dtoToCollection(dto)
    expect(result.nodes).toEqual([])
  })

  it('should default edges to empty array', () => {
    // @ts-expect-error - Test object with minimal properties
    const dto: CollectionDto = {
      id: '123',
      owner_id: 'owner-1',
      name: 'Test',
      notes: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const result = dtoToCollection(dto)
    expect(result.edges).toEqual([])
  })
})
