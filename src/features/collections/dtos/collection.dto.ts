import { z } from 'zod'

export const collectionVisibilitySchema = z.enum(['private', 'public'])

export const collectionDtoSchema = z.object({
  id: z.uuid(),
  owner_id: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  visibility: collectionVisibilitySchema.default('private'),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const collectionsListDtoSchema = z.union([
  z.array(collectionDtoSchema),
  z.object({ items: z.array(collectionDtoSchema) })
])

export const collectionCreateDtoSchema = z.object({
  owner_id: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  visibility: collectionVisibilitySchema.optional(),
})

export const collectionUpdateDtoSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  visibility: collectionVisibilitySchema.optional(),
})


export type CollectionVisibilityDto = z.infer<typeof collectionVisibilitySchema>
export type CollectionDto = z.infer<typeof collectionDtoSchema>
export type CollectionsListDto = z.infer<typeof collectionsListDtoSchema>
export type CollectionCreateDto = z.infer<typeof collectionCreateDtoSchema>
export type CollectionUpdateDto = z.infer<typeof collectionUpdateDtoSchema>