import { z } from 'zod'

export const reportSchema = z.object({
  reason: z.string().min(1, 'Veuillez sélectionner une raison'),
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
})

export type ReportFormValues = z.infer<typeof reportSchema>
