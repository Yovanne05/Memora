import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useCollectionsQuery } from '@/features/collections/hooks/useCollectionsQuery'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatTime } from '@/lib/format.utils'
import { noteEditFormSchema } from '../schemas/note.schema'
import type { Note } from '../models/note.model'
import type { NoteFormValues } from '../types/note-edit-form.types'

type UseNoteEditFormArgs = {
  note?: Note
  loading: boolean
  readOnly: boolean
  onSubmit: (values: NoteFormValues) => void | Promise<void>
}

export function useNoteEditForm({
  note,
  loading,
  readOnly,
  onSubmit,
}: UseNoteEditFormArgs) {
  const { user } = useAuth()
  const { data: collectionsData, isLoading: loadingCollections } =
    useCollectionsQuery()
  const collections = (collectionsData?.items ?? []).filter(
    (collection) => collection.ownerId === user?.id
  )

  const form = useForm({
    resolver: zodResolver(noteEditFormSchema),
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
      visibility: note?.visibility ?? 'private',
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

  const isFormDisabled = loading || form.formState.isSubmitting || readOnly

  return {
    form,
    collections,
    loadingCollections,
    savedTime,
    isFormDisabled,
    handleFormSubmit,
  }
}
