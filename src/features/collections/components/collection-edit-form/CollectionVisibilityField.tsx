import { Controller, type Control } from "react-hook-form"

import { FormSelect } from "@/components/ui/form-select"
import { VISIBILITY_OPTIONS } from "./constants"
import type { CollectionFormInput } from "../../schemas/collection.schema"

type CollectionVisibilityFieldProps = {
  control: Control<CollectionFormInput>
  disabled: boolean
  error?: { message?: string }
}

export function CollectionVisibilityField({
  control,
  disabled,
  error,
}: Readonly<CollectionVisibilityFieldProps>) {
  return (
    <Controller
      name="visibility"
      control={control}
      render={({ field }) => (
        <FormSelect
          id="collection-visibility"
          label="Visibilité"
          value={field.value || "private"}
          onValueChange={field.onChange}
          disabled={disabled}
          error={error}
          placeholder="Choisir la visibilité"
          helperText="Les collections privées ne sont visibles que par vous."
          options={VISIBILITY_OPTIONS}
        />
      )}
    />
  )
}
