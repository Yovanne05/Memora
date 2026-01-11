import { describe, it, expect } from 'vitest'
import {
  dtoToCollectionWithoutUser,
  toCollectionCreateDto,
  toCollectionUpdateDto,
} from '@/features/collections/mappers/collection.mapper'
import type { CollectionDto } from '@/features/collections/dtos/collection.dto'
import type {
  CollectionCreate,
  CollectionUpdate,
} from '@/features/collections/models/collection.model'

describe('dtoToCollectionWithoutUser', () => {
  it('should call dtoToCollection with undefined userId', () => {
    // @ts-expect-error - Test object with minimal properties
    const dto: CollectionDto = {
      id: '123',
      owner_id: 'owner-1',
      name: 'Test',
      notes: [],
      user_permission: 'write',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const result = dtoToCollectionWithoutUser(dto)
    expect(result.userPermission).toBeNull()
  })
})

describe('toCollectionCreateDto', () => {
  it('should map create payload correctly', () => {
    const payload: CollectionCreate = {
      ownerId: 'owner-1',
      name: 'New Collection',
      description: 'Description',
      visibility: 'public',
      tags: ['test'],
    }

    const result = toCollectionCreateDto(payload)

    expect(result).toEqual({
      owner_id: 'owner-1',
      name: 'New Collection',
      description: 'Description',
      visibility: 'public',
      tags: ['test'],
    })
  })

  it('should default description to null', () => {
    const payload: CollectionCreate = {
      ownerId: 'owner-1',
      name: 'New Collection',
    }

    const result = toCollectionCreateDto(payload)
    expect(result.description).toBeNull()
  })

  it('should default visibility to private', () => {
    const payload: CollectionCreate = {
      ownerId: 'owner-1',
      name: 'New Collection',
    }

    const result = toCollectionCreateDto(payload)
    expect(result.visibility).toBe('private')
  })
})

describe('toCollectionUpdateDto', () => {
  it('should map update payload correctly', () => {
    const payload: CollectionUpdate = {
      name: 'Updated',
      description: 'New desc',
      visibility: 'private',
      tags: ['updated'],
    }

    const result = toCollectionUpdateDto(payload)

    expect(result).toEqual({
      name: 'Updated',
      description: 'New desc',
      visibility: 'private',
      tags: ['updated'],
    })
  })

  it('should handle partial updates', () => {
    const payload: CollectionUpdate = {
      name: 'Just Name',
    }

    const result = toCollectionUpdateDto(payload)
    expect(result.name).toBe('Just Name')
    expect(result.description).toBeUndefined()
  })
})
