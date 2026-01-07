import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import type { CollectionVisibility } from "../models/collection.model"
import {
  collectionFormSchema,
  type CollectionFormInput,
} from "../schemas/collection.schema"
import type { CollectionEditFormProps, CollectionFormValues } from "../types/collection-form.types"

type UseCollectionEditFormArgs = Pick<
  CollectionEditFormProps,
  "mode" | "initial" | "onSubmit"
>

export function useCollectionEditForm({
  mode,
  initial,
  onSubmit,
}: UseCollectionEditFormArgs) {
  const form = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      visibility: (initial?.visibility ?? "private") as CollectionVisibility,
      tags: initial?.tags ?? [],
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    getFieldState,
  } = form

  const isEdit = mode === "edit"
  const submitButtonText = isEdit
    ? "Enregistrer les modifications"
    : "Créer la collection"

  const handleFormSubmit = useCallback(
    (data: CollectionFormInput) => {
      const payload: CollectionFormValues = {
        name: data.name,
        description: data.description ?? undefined,
        visibility: data.visibility,
      }

      const hasTags = Array.isArray(data.tags) && data.tags.length > 0
      const tagsDirty = getFieldState("tags").isDirty

      if (hasTags || tagsDirty) {
        payload.tags = data.tags ?? []
      }

      return onSubmit(payload)
    },
    [getFieldState, onSubmit]
  )

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    control,
    submitButtonText,
    handleFormSubmit,
  }
}


