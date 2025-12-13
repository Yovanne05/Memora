import { z } from 'zod'

export const noteLinkDtoSchema = z.object({
  note_id: z.uuid(),
  linked_note_id: z.uuid(),
  created_at: z.iso.datetime(),
})

export const noteLinksListDtoSchema = z.array(noteLinkDtoSchema)

export const paginatedNoteLinksSchema = z.object({
  items: z.array(noteLinkDtoSchema),
  total: z.number(),
})

export const createNoteLinkDtoSchema = z.object({
  linked_note_id: z.uuid(),
})

export type NoteLinkDto = z.infer<typeof noteLinkDtoSchema>
export type NoteLinksListDto = z.infer<typeof noteLinksListDtoSchema>
export type PaginatedNoteLinksDto = z.infer<typeof paginatedNoteLinksSchema>
export type CreateNoteLinkDto = z.infer<typeof createNoteLinkDtoSchema>
