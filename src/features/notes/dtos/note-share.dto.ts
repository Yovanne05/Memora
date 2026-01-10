import { z } from 'zod'
import { userDtoSchema } from '@/features/users/dto/user.dto'

export const SharePermissionSchema = z.enum(['read', 'write', 'owner'])
export type SharePermission = z.infer<typeof SharePermissionSchema>

export const NoteShareDtoSchema = z.object({
  note_id: z.uuid(),
  user: userDtoSchema.optional(),
  user_id: z.uuid().optional(),
  permission: SharePermissionSchema,
  created_at: z.iso.datetime(),
})

export type NoteShareDto = z.infer<typeof NoteShareDtoSchema>

export const NoteShareCreateDtoSchema = z.object({
  user_id: z.uuid(),
  permission: SharePermissionSchema.default('read'),
})

export type NoteShareCreateDto = z.infer<typeof NoteShareCreateDtoSchema>

export const NoteShareUpdateDtoSchema = z.object({
  permission: SharePermissionSchema,
})

export type NoteShareUpdateDto = z.infer<typeof NoteShareUpdateDtoSchema>

export const NoteShareListDtoSchema = z.object({
  items: z.array(NoteShareDtoSchema),
  total: z.number(),
})

export type NoteShareListDto = z.infer<typeof NoteShareListDtoSchema>
