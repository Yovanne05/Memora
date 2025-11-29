import type { FieldError } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { FormField } from "./form-field"

export interface FormSelectProps {
  id: string
  label: string
  error?: FieldError
  helperText?: string
  required?: boolean
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

export function FormSelect({
  id,
  label,
  error,
  helperText,
  required,
  value,
  onValueChange,
  disabled,
  placeholder,
  options,
}: FormSelectProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error?.message}
      helperText={helperText}
      required={required}
    >
      <Select
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          id={id}
          aria-describedby={
            error
              ? `${id}-error`
              : helperText
                ? `${id}-helper`
                : undefined
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
