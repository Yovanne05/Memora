import { z } from 'zod'

export const ReportDtoSchema = z.object({
  id: z.uuid(),
  target_type: z.string(),
  note_id: z.uuid().nullable().optional(),
  collection_id: z.uuid().nullable().optional(),
  reason: z.string(),
  status: z.string(),
  description: z.string().nullable().optional(),
  reporter_id: z.uuid(),
  reporter_email: z.string().email().nullable().optional(),
  note_title: z.string().nullable().optional(),
  collection_name: z.string().nullable().optional(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export type ReportDto = z.infer<typeof ReportDtoSchema>

export const ReportCreateDtoSchema = z.object({
  reason: z.string(),
  description: z.string().nullable().optional(),
})

export type ReportCreateDto = z.infer<typeof ReportCreateDtoSchema>

export const ReportUpdateDtoSchema = z.object({
  status: z.string(),
  action: z.string().nullable().optional(),
})

export type ReportUpdateDto = z.infer<typeof ReportUpdateDtoSchema>

export const ReportListDtoSchema = z.object({
  items: z.array(ReportDtoSchema),
  total: z.number(),
})

export type ReportListDto = z.infer<typeof ReportListDtoSchema>
