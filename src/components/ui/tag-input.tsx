import * as React from "react"
import { cn } from "@/lib/utils"
import { TagInputField } from "./tag-input/TagInputField"
import { TagInputMessages } from "./tag-input/TagInputMessages"
import { TagList } from "./tag-input/TagList"
import { useTagInput } from "./tag-input/useTagInput"

export interface TagInputProps {
  readonly value: string[]
  readonly onChange: (tags: string[]) => void
  readonly placeholder?: string
  readonly maxTags?: number
  readonly className?: string
  readonly disabled?: boolean
  readonly error?: string
  readonly id?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Ajouter un tag...",
  maxTags = 20,
  className,
  disabled = false,
  error,
  id,
}: Readonly<TagInputProps>) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const tagInputId = React.useId()

  const { inputValue, setInputValue, handleKeyDown, handleInputBlur, removeTag } =
    useTagInput({ value, onChange, maxTags, disabled })

  const maxed = value.length >= maxTags

  return (
    <div className={cn("space-y-2", className)}>
      <label
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-[color,box-shadow] outline-none cursor-text",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          error && "border-destructive aria-invalid:ring-destructive/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <TagList tags={value} disabled={disabled} onRemove={removeTag} id={tagInputId} />
        <TagInputField
          id={id}
          inputRef={inputRef}
          value={inputValue}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          maxed={maxed}
          onChange={setInputValue}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
        />
      </label>
      <TagInputMessages error={error} maxTags={maxTags} count={value.length} />
    </div>
  )
}
