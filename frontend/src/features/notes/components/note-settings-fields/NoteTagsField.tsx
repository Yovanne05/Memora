import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { TagInput } from '@/components/ui/tag-input'
import type { UseFormReturn } from 'react-hook-form'
import type { NoteFormValues } from '../../types/note-edit-form.types'

type NoteTagsFieldProps = {
  form: UseFormReturn<NoteFormValues>
  disabled: boolean
}

export function NoteTagsField({
  form,
  disabled,
}: Readonly<NoteTagsFieldProps>) {
  return (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Tags</FormLabel>
          <FormControl>
            <TagInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Ajouter des tags"
              maxTags={20}
              disabled={disabled}
              error={form.formState.errors.tags?.message}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
