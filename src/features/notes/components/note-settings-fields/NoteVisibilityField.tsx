import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import type { UseFormReturn } from 'react-hook-form'
import type { NoteFormValues } from '../../types/note-edit-form.types'

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
          <FormLabel className="text-sm font-medium">Visibilité</FormLabel>
          <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <span className="text-sm">
              {field.value === 'public' ? 'Publique' : 'Privée'}
            </span>
            <FormControl>
              <Switch
                id="note-visibility"
                aria-label="Basculer la visibilité"
                checked={field.value === 'public'}
                onCheckedChange={(checked) =>
                  field.onChange(checked ? 'public' : 'private')
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
