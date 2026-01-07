import * as React from "react"
import { Input } from "@/components/ui/input"

type TagInputFieldProps = {
  id?: string
  inputRef: React.RefObject<HTMLInputElement>
  value: string
  placeholder?: string
  disabled: boolean
  maxed: boolean
  onChange: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur: () => void
}

export function TagInputField({
  id,
  inputRef,
  value,
  placeholder,
  disabled,
  maxed,
  onChange,
  onKeyDown,
  onBlur,
}: Readonly<TagInputFieldProps>) {
  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || maxed}
      className="h-7 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 min-w-[120px]"
    />
  )
}
