interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  attrs?: Record<string, unknown>
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

interface TipTapDocument {
  type: 'doc'
  content: TipTapNode[]
}

function isJSONContent(content: string): boolean {
  if (!content || content.trim().length === 0) return false

  try {
    const parsed = JSON.parse(content)
    return parsed && typeof parsed === 'object' && 'type' in parsed
  } catch {
    return false
  }
}

function extractTextFromNode(node: TipTapNode): string {
  if (node.text) {
    return node.text
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map(child => extractTextFromNode(child)).join('')
  }

  return ''
}

export function stripHTML(content: string): string {
  if (!content) return ''

  if (isJSONContent(content)) {
    try {
      const doc: TipTapDocument = JSON.parse(content)
      return extractTextFromNode(doc)
    } catch {
      return content
    }
  }

  return content
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...'
}

export function getContentPreview(content: string, maxLength: number = 150): string {
  const plainText = stripHTML(content)
  return truncateText(plainText, maxLength)
}
