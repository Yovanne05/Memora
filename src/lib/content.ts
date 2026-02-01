function isJSONContent(content: string): boolean {
  if (!content || content.trim().length === 0) return false

  try {
    const parsed = JSON.parse(content)
    return parsed && typeof parsed === "object" && "type" in parsed
  } catch {
    return false
  }
}

export function parseContent(content: string) {
  if (!content || content.trim().length === 0) {
    return ""
  }

  if (isJSONContent(content)) {
    try {
      return JSON.parse(content)
    } catch {
      return content
    }
  }
  return content
}
