import type { Control } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { TagInput } from "@/components/ui/tag-input"
import type { NoteCreateFormInput } from "../../schemas/note.schema"

type TagsFieldProps = {
  control: Control<NoteCreateFormInput>
  isFormDisabled: boolean
  errorMessage?: string
}

export function TagsField({
  control,
  isFormDisabled,
  errorMessage,
}: Readonly<TagsFieldProps>) {
  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags (optionnel)</FormLabel>
          <FormControl>
            <TagInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Ajouter des tags (Entrée ou virgule pour valider)"
              maxTags={20}
              disabled={isFormDisabled}
              error={errorMessage}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
