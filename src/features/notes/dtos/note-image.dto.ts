import { z } from "zod"

export const noteImageDtoSchema = z.object({
  url: z.string().min(1),
})

export type NoteImageDto = z.infer<typeof noteImageDtoSchema>
