import { z } from "zod"

export const noteVisibilityFormSchema = z.enum(["private", "public"])

export const noteCreateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne doit pas depasser 255 caracteres"),
  collectionId: z
    .uuid({ message: "Identifiant de collection invalide" })
    .nullable()
    .optional(),
  visibility: noteVisibilityFormSchema,
  tags: z
    .array(z.string().trim().min(1, "Le tag ne peut pas etre vide"))
    .max(20, "20 tags maximum"),
})

export const noteEditFormSchema = noteCreateFormSchema.extend({
  content: z.string().trim().optional(),
})

export type NoteCreateFormInput = z.infer<typeof noteCreateFormSchema>
export type NoteEditFormInput = z.infer<typeof noteEditFormSchema>
