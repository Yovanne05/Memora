import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { Note, NoteVisibility } from "../models/note.model"
import { noteEditFormSchema } from "../schemas/note.schema"
import { formatTime } from "@/lib/format.utils"
import { FormActions } from "./FormActions"
import { NoteContentFields } from "./NoteContentFields"
import { NoteSettingsFields } from "./NoteSettingsFields"

export interface NoteFormValues {
  title: string
  content: string
  visibility: NoteVisibility
  collectionId?: string | null
  tags: string[]
}

interface NoteEditFormProps {
  note?: Note
  loading?: boolean
  onSubmit: (values: NoteFormValues) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  deleteLoading?: boolean
}

/**
 * Formulaire d'édition de note
 * Refactorisé en sous-composants pour une meilleure lisibilité
 */
export function NoteEditForm({
  note,
  loading = false,
  onSubmit,
  onCancel,
  onDelete,
  deleteLoading = false,
}: Readonly<NoteEditFormProps>) {
  const { data: collectionsData, isLoading: loadingCollections } = useCollectionsQuery()
  const collections = collectionsData?.items ?? []

  const form = useForm({
    resolver: zodResolver(noteEditFormSchema),
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
      visibility: note?.visibility ?? "private",
      collectionId: note?.collectionId ?? null,
      tags: note?.tags ?? [],
    },
  })

  const savedTime = useMemo(() => {
    if (!note?.updatedAt) return null
    return formatTime(note.updatedAt)
  }, [note])

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      content: values.content,
      visibility: values.visibility,
      collectionId: values.collectionId ?? null,
      tags: values.tags,
    })
  })

  const isFormDisabled = loading || form.formState.isSubmitting

  return (
    <Form {...form} key={note?.id}>
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        <FormActions
          savedTime={savedTime}
          isUpdate={!!note}
          loading={isFormDisabled}
          deleteLoading={deleteLoading}
          onCancel={onCancel}
          onDelete={onDelete}
        />

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <NoteContentFields
            form={form}
            disabled={isFormDisabled}
            noteId={note?.id}
          />

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
