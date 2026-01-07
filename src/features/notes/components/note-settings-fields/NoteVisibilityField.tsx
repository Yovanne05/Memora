import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import type { UseFormReturn } from "react-hook-form"
import type { NoteFormValues } from "../note-edit-form/types"

type NoteVisibilityFieldProps = {
  form: UseFormReturn<NoteFormValues>
  disabled: boolean
}

export function NoteVisibilityField({
  form,
  disabled,
}: Readonly<NoteVisibilityFieldProps>) {
  return (
    <FormField
      control={form.control}
      name="visibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Visibilité</FormLabel>
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {field.value === "public" ? "Publique" : "Privée"}
              </p>
              <p className="text-xs text-muted-foreground">
                Basculer la visibilité de la note.
              </p>
            </div>
            <FormControl>
              <Switch
                id="note-visibility"
                aria-label="Basculer la visibilité"
                checked={field.value === "public"}
                onCheckedChange={(checked) =>
                  field.onChange(checked ? "public" : "private")
                }
                disabled={disabled}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
