import { Form } from "@/components/ui/form"

import { FlashcardAnswersField } from "./flashcard-form/FlashcardAnswersField"
import { FlashcardFormActions } from "./flashcard-form/FlashcardFormActions"
import { FlashcardQuestionField } from "./flashcard-form/FlashcardQuestionField"
import { useFlashcardForm } from "../hooks/useFlashcardForm"
import type { FlashcardEditForm } from "../schemas/flashcard.schema"

interface FlashcardFormProps {
  readonly noteId: string
  readonly onSubmit: (data: FlashcardEditForm) => void | Promise<void>
  readonly onCancel?: () => void
  readonly isSubmitting?: boolean
}

export function FlashcardForm({
  noteId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: Readonly<FlashcardFormProps>) {
  const { form, fields, remove, addAnswer, toggleCorrectAnswer, handleFormSubmit } =
    useFlashcardForm({ noteId, onSubmit })

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FlashcardQuestionField control={form.control} disabled={isSubmitting} />
        <FlashcardAnswersField
          control={form.control}
          form={form}
          fields={fields}
          isSubmitting={isSubmitting}
          onAddAnswer={addAnswer}
          onToggleCorrect={toggleCorrectAnswer}
          onRemove={remove}
        />
        <FlashcardFormActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  )
}



