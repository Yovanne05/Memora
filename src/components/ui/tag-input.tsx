import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { Input } from "./input"

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
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const tagInputId = React.useId()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return

    if (value.length >= maxTags) {
      return
    }

    if (value.includes(trimmedValue)) {
      setInputValue("")
      return
    }

    onChange([...value, trimmedValue])
    setInputValue("")
  }

  const removeTag = (index: number) => {
    if (disabled) return
    onChange(value.filter((_, i) => i !== index))
  }

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag()
    }
  }

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
        {value.map((tag) => (
          <Badge
            key={`${tagInputId}-tag-${tag}`}
            variant="secondary"
            className="gap-1 pr-1 text-xs"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(value.indexOf(tag))}
                className="ml-1 rounded-sm hover:bg-secondary-foreground/20 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={`Supprimer le tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || value.length >= maxTags}
          className="h-7 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 min-w-[120px]"
        />
      </label>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {value.length >= maxTags && (
        <p className="text-sm text-muted-foreground">
          Limite de {maxTags} tags atteinte
        </p>
      )}
    </div>
  )
}
