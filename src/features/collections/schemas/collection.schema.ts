import { z } from 'zod'

export const collectionFormSchema = z.object({
  name: z
    .string({ message: 'Le nom est requis' })
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .regex(/^[a-zA-Z0-9àâäçèéêëîïôùûüœæÀÂÄÇÈÉÊËÎÏÔÙÛÜŒÆ\s\-'_.]+$/, 'Le nom contient des caractères invalides'),
  description: z
    .string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .nullable()
    .transform(val => val === '' ? null : val)
    .optional(),
  visibility: z
    .enum(['private', 'public'], {
      message: 'La visibilité doit être privée ou publique',
    }),
})

export type CollectionFormInput = z.infer<typeof collectionFormSchema>
