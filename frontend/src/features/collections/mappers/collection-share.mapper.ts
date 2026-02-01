import type {
  CollectionShareDto,
  CollectionShareCreateDto,
  CollectionShareUpdateDto,
} from '../dtos/collection-share.dto'
import type {
  CollectionShare,
  CollectionShareCreate,
  CollectionShareUpdate,
} from '../models/collection-share.model'
import { dtoToUser } from '@/features/users/mappers/user.mapper'

export function dtoToCollectionShare(dto: CollectionShareDto): CollectionShare {
  return {
    collectionId: dto.collection_id,
    userId: dto.user.id,
    user: dtoToUser(dto.user),
    permission: dto.permission,
    createdAt: new Date(dto.created_at),
  }
}

export function collectionShareCreateToDto(
  model: CollectionShareCreate
): CollectionShareCreateDto {
  return {
    user_id: model.userId,
    permission: model.permission,
  }
}

export function collectionShareUpdateToDto(
  model: CollectionShareUpdate
): CollectionShareUpdateDto {
  return {
    permission: model.permission,
  }
}
