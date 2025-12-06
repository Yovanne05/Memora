import { z } from 'zod'

export const noteLinkDtoSchema = z.object({
  note_id: z.string().uuid(),
  linked_note_id: z.string().uuid(),
  created_at: z.string().datetime(),
})

export const noteLinksListDtoSchema = z.array(noteLinkDtoSchema)

export const createNoteLinkDtoSchema = z.object({
  linked_note_id: z.string().uuid(),
})

export type NoteLinkDto = z.infer<typeof noteLinkDtoSchema>
export type NoteLinksListDto = z.infer<typeof noteLinksListDtoSchema>
export type CreateNoteLinkDto = z.infer<typeof createNoteLinkDtoSchema>
