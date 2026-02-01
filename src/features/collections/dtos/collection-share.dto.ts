import { z } from 'zod'
import { userDtoSchema } from '@/features/users/dto/user.dto'

export const SharePermissionSchema = z.enum(['read', 'write', 'owner'])
export type SharePermission = z.infer<typeof SharePermissionSchema>

export const CollectionShareDtoSchema = z.object({
  collection_id: z.uuid(),
  user: userDtoSchema,
  permission: SharePermissionSchema,
  created_at: z.iso.datetime(),
})

export type CollectionShareDto = z.infer<typeof CollectionShareDtoSchema>

export const CollectionShareCreateDtoSchema = z.object({
  user_id: z.uuid(),
  permission: SharePermissionSchema.default('read'),
})

export type CollectionShareCreateDto = z.infer<
  typeof CollectionShareCreateDtoSchema
>

export const CollectionShareUpdateDtoSchema = z.object({
  permission: SharePermissionSchema,
})

export type CollectionShareUpdateDto = z.infer<
  typeof CollectionShareUpdateDtoSchema
>

export const CollectionShareListDtoSchema = z.object({
  items: z.array(CollectionShareDtoSchema),
  total: z.number(),
})

export type CollectionShareListDto = z.infer<
  typeof CollectionShareListDtoSchema
>
