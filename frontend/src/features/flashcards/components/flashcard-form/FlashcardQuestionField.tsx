import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Control } from "react-hook-form"
import type { FlashcardEditFormInput } from "../../schemas/flashcard.schema"

type FlashcardQuestionFieldProps = {
  control: Control<FlashcardEditFormInput>
  disabled: boolean
}

export function FlashcardQuestionField({
  control,
  disabled,
}: Readonly<FlashcardQuestionFieldProps>) {
  return (
    <FormField
      control={control}
      name="question"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Question</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder="Quelle est la capitale de la France ?"
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
