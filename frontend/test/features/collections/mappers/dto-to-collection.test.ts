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

describe('dtoToCollection', () => {
  it('should map all required fields correctly', () => {
    const dto: CollectionDto = {
      id: '123',
      owner_id: 'owner-1',
      name: 'Test Collection',
      description: 'A test collection',
      visibility: 'public',
      is_favorite: true,
      tags: ['tag1', 'tag2'],
      notes: [],
      nodes: [],
      edges: [],
      user_permission: 'write',
      user_access: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const result = dtoToCollection(dto, 'user-1')

    expect(result).toMatchObject({
      id: '123',
      ownerId: 'owner-1',
      name: 'Test Collection',
      description: 'A test collection',
      visibility: 'public',
      isFavorite: true,
      tags: ['tag1', 'tag2'],
      userPermission: 'write',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    })
  })

  it('should default description to null when undefined', () => {
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
    expect(result.description).toBeNull()
  })

  it('should default visibility to private', () => {
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
    expect(result.visibility).toBe('private')
  })
})
