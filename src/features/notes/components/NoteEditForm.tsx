import { Form } from "@/components/ui/form"

import { FormActions } from "./FormActions"
import { NoteContentFields } from "./NoteContentFields"
import { NoteSettingsFields } from "./NoteSettingsFields"
import type { NoteEditFormProps, NoteFormValues } from "../types/note-edit-form.types"
import { useNoteEditForm } from "../hooks/useNoteEditForm"

export type { NoteFormValues } from "../types/note-edit-form.types"

export function NoteEditForm({
  note,
  loading = false,
  readOnly = false,
  onSubmit,
  onCancel,
  onDelete,
  deleteLoading = false,
}: Readonly<NoteEditFormProps>) {
  const {
    form,
    collections,
    loadingCollections,
    savedTime,
    isFormDisabled,
    handleFormSubmit,
  } = useNoteEditForm({ note, loading, readOnly, onSubmit })

  return (
    <Form {...form} key={note?.id}>
      <form
        className="space-y-6"
        onSubmit={readOnly ? (event) => event.preventDefault() : handleFormSubmit}
      >
        <FormActions
          savedTime={savedTime}
          isUpdate={!!note}
          loading={isFormDisabled}
          deleteLoading={deleteLoading}
          onCancel={onCancel}
          onDelete={onDelete}
          readOnly={readOnly}
        />

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <NoteContentFields form={form} disabled={isFormDisabled} noteId={note?.id} />
          <NoteSettingsFields
            form={form}
            disabled={isFormDisabled}
            collections={collections}
            loadingCollections={loadingCollections}
          />
        </div>
      </form>
    </Form>
  )
}




