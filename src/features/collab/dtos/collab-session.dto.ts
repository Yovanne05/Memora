import { z } from "zod"

export const collabSessionPayloadSchema = z.object({
  note_id: z.uuid(),
})

export const collabSessionDtoSchema = z.object({
  collab_token: z.string(),
  expires_in: z.number(),
  scope: z.array(z.string()),
})

export type CollabSessionPayloadDto = z.infer<typeof collabSessionPayloadSchema>
export type CollabSessionDto = z.infer<typeof collabSessionDtoSchema>
