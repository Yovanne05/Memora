import { Check, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Control, UseFormReturn } from "react-hook-form"
import type { FlashcardEditFormInput } from "../../schemas/flashcard.schema"

type FlashcardAnswerItemProps = {
  control: Control<FlashcardEditFormInput>
  form: UseFormReturn<FlashcardEditFormInput>
  index: number
  fieldId: string
  isCorrect: boolean
  canRemove: boolean
  isSubmitting: boolean
  onToggleCorrect: (index: number) => void
  onRemove: (index: number) => void
}

export function FlashcardAnswerItem({
  control,
  form,
  index,
  fieldId,
  isCorrect,
  canRemove,
  isSubmitting,
  onToggleCorrect,
  onRemove,
}: Readonly<FlashcardAnswerItemProps>) {
  return (
    <div
      key={fieldId}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border transition-colors",
        isCorrect ? "border-primary bg-primary/5" : "border-border bg-card"
      )}
    >
      <Button
        type="button"
        size="icon"
        variant={isCorrect ? "default" : "outline"}
        className="h-8 w-8 shrink-0"
        onClick={() => onToggleCorrect(index)}
        disabled={isSubmitting}
        title={isCorrect ? "Réponse correcte" : "Marquer comme correcte"}
      >
        <Check className="h-4 w-4" />
      </Button>

      <FormField
        control={control}
        name={`answers.${index}.answerText`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input
                {...field}
                placeholder={`Réponse ${index + 1}`}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {canRemove && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(index)}
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
