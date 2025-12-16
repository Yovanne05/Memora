import { memo, useCallback } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { FormTextarea } from "@/components/ui/form-textarea"
import { FormSelect } from "@/components/ui/form-select"
import { TagInput } from "@/components/ui/tag-input"
import type { CollectionVisibility } from "../../models/collection.model"
import { collectionFormSchema, type CollectionFormInput } from "../../schemas/collection.schema"

export interface CollectionFormValues {
  name: string
  description?: string
  visibility: CollectionVisibility
  tags?: string[]
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
  const form = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      visibility: initial?.visibility ?? "private" as CollectionVisibility,
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
  const isFormDisabled = loading || isSubmitting

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
    [onSubmit, getFieldState]
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

      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <div className="space-y-1.5">
            <label htmlFor="collection-tags" className="text-sm font-medium">
              Tags
            </label>
            <TagInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Ajouter des tags (Entrée ou virgule pour valider)"
              maxTags={20}
              disabled={isFormDisabled}
              error={errors.tags?.message}
            />
            <p className="text-sm text-muted-foreground">
              Les tags vous aident à organiser et retrouver vos collections.
            </p>
          </div>
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
