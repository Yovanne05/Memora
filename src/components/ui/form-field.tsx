import React from "react"
import { Label } from "./label"

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  helperText?: string
  children: React.ReactNode
  required?: boolean
}

export function FormField({
  id,
  label,
  error,
  helperText,
  children,
  required = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <span
          id={`${id}-error`}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </span>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
