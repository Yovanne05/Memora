import { memo } from "react"

import { FormInput } from "@/components/ui/form-input"
import { FormTextarea } from "@/components/ui/form-textarea"
import { CollectionFormActions } from "./collection-edit-form/CollectionFormActions"
import { CollectionTagsField } from "./collection-edit-form/CollectionTagsField"
import { CollectionVisibilityField } from "./collection-edit-form/CollectionVisibilityField"
import { useCollectionEditForm } from "./collection-edit-form/useCollectionEditForm"
import type { CollectionEditFormProps } from "./collection-edit-form/types"

export type { CollectionFormValues } from "./collection-edit-form/types"

export const CollectionEditForm = memo(function CollectionEditForm({
  mode,
  initial,
  loading = false,
  onSubmit,
  onCancel,
}: CollectionEditFormProps) {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    control,
    submitButtonText,
    handleFormSubmit,
  } = useCollectionEditForm({ mode, initial, onSubmit })

  const isFormDisabled = loading || isSubmitting

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormInput
        id="collection-name"
        label="Nom de la collection"
        placeholder="ex. Fondamentaux de l'informatique"
        disabled={isFormDisabled}
        error={errors.name}
        {...register("name")}
      />

      <FormTextarea
        id="collection-description"
        label="Description"
        rows={3}
        placeholder="Décrivez l'objectif de cette collection..."
        disabled={isFormDisabled}
        error={errors.description}
        {...register("description")}
      />

      <CollectionVisibilityField
        control={control}
        disabled={isFormDisabled}
        error={errors.visibility}
      />

      <CollectionTagsField
        control={control}
        disabled={isFormDisabled}
        errorMessage={errors.tags?.message}
      />

      <CollectionFormActions
        onCancel={onCancel}
        disabled={isFormDisabled}
        submitLabel={submitButtonText}
      />
    </form>
  )
})
