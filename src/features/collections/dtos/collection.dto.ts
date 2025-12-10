import { noteDtoSchema } from '@/features/notes/dto/note.dto'
import { z } from 'zod'

export const collectionVisibilitySchema = z.enum(['private', 'public'])

export const graphNodeDtoSchema = z.object({
  id: z.string(),
  data: z.object({
    label: z.string(),
    note_id: z.string(),
    title: z.string(),
    tags: z.array(z.string()),
  }),
})

export const graphEdgeDtoSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
})

export const collectionDtoSchema = z.object({
  id: z.uuid(),
  owner_id: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  visibility: collectionVisibilitySchema.default('private'),
  tags: z.array(z.string()).default([]),
  notes: z.array(noteDtoSchema),
  nodes: z.array(graphNodeDtoSchema).default([]),
  edges: z.array(graphEdgeDtoSchema).default([]),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const collectionsListDtoSchema = z.union([
  z.array(collectionDtoSchema),
  z.object({
    items: z.array(collectionDtoSchema),
    total: z.number()
  })
])

export const collectionCreateDtoSchema = z.object({
  owner_id: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  visibility: collectionVisibilitySchema.optional(),
  tags: z.array(z.string()).optional(),
})

export const collectionUpdateDtoSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  visibility: collectionVisibilitySchema.optional(),
  tags: z.array(z.string()).optional(),
})


export type CollectionVisibilityDto = z.infer<typeof collectionVisibilitySchema>
export type GraphNodeDto = z.infer<typeof graphNodeDtoSchema>
export type GraphEdgeDto = z.infer<typeof graphEdgeDtoSchema>
export type CollectionDto = z.infer<typeof collectionDtoSchema>
export type CollectionsListDto = z.infer<typeof collectionsListDtoSchema>
export type CollectionCreateDto = z.infer<typeof collectionCreateDtoSchema>
export type CollectionUpdateDto = z.infer<typeof collectionUpdateDtoSchema>