import { z } from 'zod'
import { REPORT_REASONS } from '../types/report-reason'

export const reportSchema = z.object({
  reason: z.enum(Object.keys(REPORT_REASONS) as [string, ...string[]], {
    errorMap: () => ({ message: 'Veuillez sélectionner une raison' }),
  }),
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
})

export type ReportFormValues = z.infer<typeof reportSchema>
