import { z } from 'zod'

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
  })
}

export function createArrayOrPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.union([z.array(itemSchema), createPaginatedResponseSchema(itemSchema)])
}
