import type { Control } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { NoteCreateFormInput } from "../../schemas/note.schema"

type TitleFieldProps = {
  control: Control<NoteCreateFormInput>
  isFormDisabled: boolean
}

export function TitleField({ control, isFormDisabled }: Readonly<TitleFieldProps>) {
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nom de la note</FormLabel>
          <FormControl>
            <Input
              {...field}
              id="note-title"
              disabled={isFormDisabled}
              placeholder="Ex. Cours de SQL - Chapitre 1"
              autoFocus
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
