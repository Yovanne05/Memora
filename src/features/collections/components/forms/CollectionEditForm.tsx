import { memo, useCallback, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { FormTextarea } from "@/components/ui/form-textarea"
import { FormSelect } from "@/components/ui/form-select"
import type { CollectionVisibility } from "../../models/collection.model"
import { collectionFormSchema, type CollectionFormInput } from "../../schemas/collection.schema"

export interface CollectionFormValues {
  name: string
  description?: string
  visibility: CollectionVisibility
}

interface CollectionEditFormProps {
  mode: "create" | "edit"
  initial?: CollectionFormValues
  loading?: boolean
  onSubmit: (values: CollectionFormValues) => void | Promise<void>
  onCancel?: () => void
}

const VISIBILITY_OPTIONS: { value: string; label: string }[] = [
  { value: "private", label: "Privée" },
  { value: "public", label: "Publique" },
]

export const CollectionEditForm = memo(function CollectionEditForm({
  mode,
  initial,
  loading = false,
  onSubmit,
  onCancel,
}: CollectionEditFormProps) {
  const defaultValues = useMemo(
    () => ({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      visibility: initial?.visibility ?? "private" as CollectionVisibility,
    }),
    [initial]
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues,
  })

  const isEdit = mode === "edit"
  const isFormDisabled = loading || isSubmitting

  const handleFormSubmit = useCallback(
    (data: CollectionFormInput) => {
      return onSubmit({
        name: data.name,
        description: data.description ?? undefined,
        visibility: data.visibility,
      })
    },
    [onSubmit]
  )

  const submitButtonText = isEdit ? "Enregistrer les modifications" : "Créer la collection"

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

      <Controller
        name="visibility"
        control={control}
        render={({ field }) => (
          <FormSelect
            id="collection-visibility"
            label="Visibilité"
            value={field.value || "private"}
            onValueChange={field.onChange}
            disabled={isFormDisabled}
            error={errors.visibility}
            placeholder="Choisir la visibilité"
            helperText="Les collections privées ne sont visibles que par vous."
            options={VISIBILITY_OPTIONS}
          />
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isFormDisabled}
          >
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isFormDisabled}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  )
})
