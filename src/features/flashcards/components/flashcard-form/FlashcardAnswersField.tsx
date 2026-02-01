import { Check } from "lucide-react"

import { FormLabel } from "@/components/ui/form"
import type { Control, UseFormReturn } from "react-hook-form"
import type { FlashcardEditFormInput } from "../../schemas/flashcard.schema"
import { FlashcardAnswerItem } from "./FlashcardAnswerItem"
import { FlashcardAnswersHeader } from "./FlashcardAnswersHeader"

type FlashcardAnswersFieldProps = {
  control: Control<FlashcardEditFormInput>
  form: UseFormReturn<FlashcardEditFormInput>
  fields: Array<{ id: string }>
  isSubmitting: boolean
  onAddAnswer: () => void
  onToggleCorrect: (index: number) => void
  onRemove: (index: number) => void
}

export function FlashcardAnswersField({
  control,
  form,
  fields,
  isSubmitting,
  onAddAnswer,
  onToggleCorrect,
  onRemove,
}: Readonly<FlashcardAnswersFieldProps>) {
  const answersError =
    form.formState.errors.answers &&
    !Array.isArray(form.formState.errors.answers)
      ? form.formState.errors.answers.message
      : undefined

  return (
    <div className="space-y-3">
      <FlashcardAnswersHeader
        count={fields.length}
        isSubmitting={isSubmitting}
        onAdd={onAddAnswer}
      />

      {answersError && (
        <p className="text-sm font-medium text-destructive">{answersError}</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <FlashcardAnswerItem
            key={field.id}
            fieldId={field.id}
            control={control}
            index={index}
            isCorrect={form.watch(`answers.${index}.isCorrect`) ?? false}
            canRemove={fields.length > 2}
            isSubmitting={isSubmitting}
            onToggleCorrect={onToggleCorrect}
            onRemove={onRemove}
          />
        ))}
      </div>

      <FormLabel className="text-xs text-muted-foreground">
        Cliquez sur l'icône <Check className="inline h-3 w-3" /> pour marquer la
        réponse correcte
      </FormLabel>
    </div>
  )
}
