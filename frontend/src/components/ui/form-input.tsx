import React from "react"
import type { FieldError } from "react-hook-form"
import { Input } from "./input"
import { FormField } from "./form-field"

export interface FormInputProps
  extends React.ComponentProps<"input"> {
  label: string
  error?: FieldError
  helperText?: string
  required?: boolean
}

export const FormInput = React.forwardRef<
  HTMLInputElement,
  FormInputProps
>(
  (
    {
      id = "",
      label,
      error,
      helperText,
      required,
      disabled,
      ...inputProps
    },
    ref
  ) => {
    const getAriaDescribedBy = () => {
      if (error) return `${id}-error`;
      if (helperText) return `${id}-helper`;
      return undefined;
    };

    return (
      <FormField
        id={id}
        label={label}
        error={error?.message}
        helperText={helperText}
        required={required}
      >
        <Input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-describedby={getAriaDescribedBy()}
          {...inputProps}
        />
      </FormField>
    )
  }
)

FormInput.displayName = "FormInput"
