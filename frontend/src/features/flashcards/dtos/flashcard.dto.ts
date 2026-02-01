import { z } from 'zod'

export const flashcardAnswerDtoSchema = z.object({
  id: z.uuid(),
  flashcard_id: z.uuid(),
  answer_text: z.string().min(1),
  created_at: z.string(),
})

export const flashcardAnswerCreateDtoSchema = z.object({
  answer_text: z.string().min(1),
  is_correct: z.boolean(),
})

export type FlashcardAnswerDto = z.infer<typeof flashcardAnswerDtoSchema>
export type FlashcardAnswerCreateDto = z.infer<
  typeof flashcardAnswerCreateDtoSchema
>

export const flashcardDtoSchema = z.object({
  id: z.uuid(),
  note_id: z.uuid(),
  question: z.string().min(1),
  answers: z.array(flashcardAnswerDtoSchema),
  created_at: z.string(),
  updated_at: z.string(),
})

export const flashcardCreateDtoSchema = z.object({
  question: z.string().min(1),
  answers: z.array(flashcardAnswerCreateDtoSchema).min(1),
})

export const flashcardUpdateDtoSchema = z.object({
  question: z.string().min(1).optional(),
  answers: z.array(flashcardAnswerCreateDtoSchema).min(1).optional(),
})

export const flashcardDuplicateDtoSchema = z.object({
  target_note_id: z.uuid().optional(),
})

export const flashcardsListDtoSchema = z.object({
  items: z.array(flashcardDtoSchema),
  total: z.number(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type FlashcardDto = z.infer<typeof flashcardDtoSchema>
export type FlashcardCreateDto = z.infer<typeof flashcardCreateDtoSchema>
export type FlashcardUpdateDto = z.infer<typeof flashcardUpdateDtoSchema>
export type FlashcardDuplicateDto = z.infer<typeof flashcardDuplicateDtoSchema>
export type FlashcardsListDto = z.infer<typeof flashcardsListDtoSchema>
