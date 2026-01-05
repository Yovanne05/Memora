import { z } from "zod"

export const noteImageDtoSchema = z.object({
  url: z.url(),
})

export type NoteImageDto = z.infer<typeof noteImageDtoSchema>
