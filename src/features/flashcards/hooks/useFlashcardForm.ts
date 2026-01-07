import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  flashcardEditFormSchema,
  type FlashcardEditForm,
  type FlashcardEditFormInput,
} from "../schemas/flashcard.schema"
import { MAX_ANSWERS } from "../types/flashcard-form.constants"

type UseFlashcardFormArgs = {
  noteId: string
  onSubmit: (data: FlashcardEditForm) => void | Promise<void>
}

export function useFlashcardForm({ noteId, onSubmit }: UseFlashcardFormArgs) {
  const form = useForm<FlashcardEditFormInput, unknown, FlashcardEditForm>({
    resolver: zodResolver(flashcardEditFormSchema),
    defaultValues: {
      noteId,
      question: "",
      answers: [
        { answerText: "", isCorrect: true },
        { answerText: "", isCorrect: false },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  })

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values)
  })

  const addAnswer = () => {
    if (fields.length < MAX_ANSWERS) {
      append({ answerText: "", isCorrect: false })
    }
  }

  const toggleCorrectAnswer = (index: number) => {
    const currentAnswers = form.getValues("answers")
    const updatedAnswers = currentAnswers.map((answer, idx) => ({
      ...answer,
      isCorrect: idx === index,
    }))
    form.setValue("answers", updatedAnswers)
  }

  return {
    form,
    fields,
    remove,
    addAnswer,
    toggleCorrectAnswer,
    handleFormSubmit,
  }
}
