import * as React from "react"

type UseTagInputArgs = {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags: number
  disabled: boolean
}

export function useTagInput({
  value,
  onChange,
  maxTags,
  disabled,
}: UseTagInputArgs) {
  const [inputValue, setInputValue] = React.useState("")

  const addTag = React.useCallback(() => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return
    if (value.length >= maxTags) return

    if (value.includes(trimmedValue)) {
      setInputValue("")
      return
    }

    onChange([...value, trimmedValue])
    setInputValue("")
  }, [inputValue, maxTags, onChange, value])

  const removeTag = React.useCallback(
    (index: number) => {
      if (disabled) return
      onChange(value.filter((_, i) => i !== index))
    },
    [disabled, onChange, value]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault()
        addTag()
      } else if (event.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value.length - 1)
      }
    },
    [addTag, disabled, inputValue, removeTag, value.length]
  )

  const handleInputBlur = React.useCallback(() => {
    if (inputValue.trim()) {
      addTag()
    }
  }, [addTag, inputValue])

  return {
    inputValue,
    setInputValue,
    handleKeyDown,
    handleInputBlur,
    removeTag,
  }
}
