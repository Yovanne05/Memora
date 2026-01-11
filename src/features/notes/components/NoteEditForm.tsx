import { Form } from '@/components/ui/form'

import { FormActions } from './FormActions'
import { NoteContentFields } from './NoteContentFields'
import { NoteSettingsFields } from './NoteSettingsFields'
import type { NoteEditFormProps } from '../types/note-edit-form.types'
import { useNoteEditForm } from '../hooks/useNoteEditForm'

export type { NoteFormValues } from '../types/note-edit-form.types'

export function NoteEditForm({
  note,
  loading = false,
  readOnly = false,
  onSubmit,
  onDelete,
  deleteLoading = false,
}: Readonly<NoteEditFormProps>) {
  const {
    form,
    collections,
    loadingCollections,
    isFormDisabled,
    handleFormSubmit,
  } = useNoteEditForm({ note, loading, readOnly, onSubmit })

  return (
    <Form {...form} key={note?.id}>
      <form
        className="w-full space-y-4 sm:space-y-6"
        onSubmit={
          readOnly ? (event) => event.preventDefault() : handleFormSubmit
        }
      >
        <FormActions
          loading={isFormDisabled}
          deleteLoading={deleteLoading}
          onDelete={onDelete}
        >
          <NoteSettingsFields
            form={form}
            disabled={isFormDisabled}
            collections={collections}
            loadingCollections={loadingCollections}
          />
        </FormActions>

        <NoteContentFields
          form={form}
          disabled={isFormDisabled}
          noteId={note?.id}
        />
      </form>
    </Form>
  )
}
