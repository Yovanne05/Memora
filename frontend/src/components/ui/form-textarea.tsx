import React from "react"
import type { FieldError } from "react-hook-form"
import { cn } from "@/lib/utils"
import { FormField } from "./form-field"

export interface FormTextareaProps
  extends React.ComponentProps<"textarea"> {
  label: string
  error?: FieldError
  helperText?: string
  required?: boolean
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    {
      id = "",
      label,
      error,
      helperText,
      required,
      disabled,
      className,
      ...textareaProps
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
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          aria-describedby={getAriaDescribedBy()}
          className={cn(
            "w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          {...textareaProps}
        />
      </FormField>
    )
  }
)

FormTextarea.displayName = "FormTextarea"
