import { z } from "zod";

export const flashcardAnswerFormSchema = z.object({
  answerText: z.string().min(1, "La réponse ne peut pas être vide"),
  isCorrect: z.boolean().default(false),
});

export type FlashcardAnswerForm = z.infer<typeof flashcardAnswerFormSchema>;

export const flashcardEditFormSchema = z
  .object({
    question: z
      .string()
      .min(1, "La question est requise")
      .max(1000, "La question ne peut pas dépasser 1000 caractères"),
    answers: z
      .array(flashcardAnswerFormSchema)
      .min(1, "Au moins une réponse est requise")
      .max(10, "Maximum 10 réponses par flashcard"),
    noteId: z.string().uuid(),
  })
  .refine(
    (data) => data.answers.some((answer) => answer.isCorrect),
    {
      message: "Au moins une réponse doit être marquée comme correcte",
      path: ["answers"],
    }
  );

export type FlashcardEditForm = z.infer<typeof flashcardEditFormSchema>;
export type FlashcardEditFormInput = z.input<typeof flashcardEditFormSchema>;

export const flashcardDuplicateFormSchema = z.object({
  targetNoteId: z.string().uuid().optional(),
});

export type FlashcardDuplicateForm = z.infer<typeof flashcardDuplicateFormSchema>;
