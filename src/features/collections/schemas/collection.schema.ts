import { z } from "zod"

export const collectionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),

  description: z
    .string()
    .max(500, "La description ne doit pas dépasser 500 caractères")
    .transform((val) => val.trim() || undefined)
    .optional(),

  visibility: z.enum(["private", "public"], {
    message: "La visibilité doit être privée ou publique",
  }),
})

export type CollectionFormInput = z.infer<typeof collectionFormSchema>
