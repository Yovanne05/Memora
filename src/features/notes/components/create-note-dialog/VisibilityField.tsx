import type { Control } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { NoteVisibility } from "../../models/note.model"
import type { NoteCreateFormInput } from "../../schemas/note.schema"

type VisibilityFieldProps = {
  control: Control<NoteCreateFormInput>
  isFormDisabled: boolean
}

export function VisibilityField({ control, isFormDisabled }: Readonly<VisibilityFieldProps>) {
  return (
    <FormField
      control={control}
      name="visibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Visibilité</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(value: NoteVisibility) => field.onChange(value)}
              disabled={isFormDisabled}
            >
              <SelectTrigger id="note-visibility" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privée</SelectItem>
                <SelectItem value="public">Publique</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
