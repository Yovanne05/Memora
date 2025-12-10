import { z } from 'zod'

export const noteVisibilitySchema = z.enum(['private', 'public'])

export const noteDtoSchema = z.object({
  id: z.uuid(),
  collection_id: z.uuid().nullable(),
  collection_name: z.string().nullable().optional(),
  owner_id: z.uuid(),
  owner_username: z.string(),
  title: z.string().min(1).max(255),
  content: z.string(),
  visibility: noteVisibilitySchema.default('private'),
  tags: z.array(z.string()).default([]),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const notesListDtoSchema = z.union([
  z.array(noteDtoSchema),
  z.object({ 
    items: z.array(noteDtoSchema), 
    total: z.number() 
  })
])

export const noteCreateDtoSchema = z.object({
  collection_id: z.uuid().nullable().optional(),
  owner_id: z.uuid(),
  title: z.string().min(1).max(255),
  content: z.string(),
  visibility: noteVisibilitySchema.optional(),
})

export const noteUpdateDtoSchema = z.object({
  collection_id: z.uuid().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  visibility: noteVisibilitySchema.optional(),
})

export type NoteVisibilityDto = z.infer<typeof noteVisibilitySchema>
export type NoteDto = z.infer<typeof noteDtoSchema>
export type NotesListDto = z.infer<typeof notesListDtoSchema>
export type NoteCreateDto = z.infer<typeof noteCreateDtoSchema>
export type NoteUpdateDto = z.infer<typeof noteUpdateDtoSchema>