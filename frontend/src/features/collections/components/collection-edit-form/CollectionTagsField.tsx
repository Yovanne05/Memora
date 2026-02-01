import { Controller, type Control } from "react-hook-form"

import { TagInput } from "@/components/ui/tag-input"
import type { CollectionFormInput } from "../../schemas/collection.schema"

type CollectionTagsFieldProps = {
  control: Control<CollectionFormInput>
  disabled: boolean
  errorMessage?: string
}

export function CollectionTagsField({
  control,
  disabled,
  errorMessage,
}: Readonly<CollectionTagsFieldProps>) {
  return (
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
            disabled={disabled}
            error={errorMessage}
          />
          <p className="text-sm text-muted-foreground">
            Les tags vous aident à organiser et retrouver vos collections.
          </p>
        </div>
      )}
    />
  )
}
