import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCollectionsQuery } from '@/features/collections/hooks/useCollectionsQuery'
import { filterManageableCollections } from '@/features/collections/lib/collection-permissions'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { NoteVisibility } from '../models/note.model'
import {
  noteCreateFormSchema,
  type NoteCreateFormInput,
} from '../schemas/note.schema'

type UseCreateNoteFormArgs = {
  submitting: boolean
  onSubmit: (payload: {
    title: string
    collectionId: string | null
    visibility: NoteVisibility
    tags: string[]
  }) => Promise<void> | void
}

export function useCreateNoteForm({
  submitting,
  onSubmit,
}: UseCreateNoteFormArgs) {
  const { user } = useAuth()
  const { data: collectionsData, isLoading: loadingCollections } =
    useCollectionsQuery()
  const collections = filterManageableCollections(
    collectionsData?.items ?? [],
    user
  )

  const form = useForm<NoteCreateFormInput>({
    resolver: zodResolver(noteCreateFormSchema),
    defaultValues: {
      title: '',
      collectionId: null,
      visibility: 'private',
      tags: [],
    },
  })

  const titleValue = useWatch({
    control: form.control,
    name: 'title',
  })

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      collectionId: values.collectionId ?? null,
      visibility: values.visibility,
      tags: values.tags,
    })
    form.reset()
  })

  const isFormDisabled = submitting || form.formState.isSubmitting

  return {
    form,
    collections,
    loadingCollections,
    titleValue,
    isFormDisabled,
    handleFormSubmit,
  }
}
