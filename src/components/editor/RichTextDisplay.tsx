import { EditorContent } from "@tiptap/react"

import { cn } from "@/lib/utils"
import { useRichTextDisplay } from "./hooks/useRichTextDisplay"
import "./editor.css"

interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({
  content,
  className,
}: Readonly<RichTextDisplayProps>) {
  const { editor, isEmpty } = useRichTextDisplay(content)

  if (!editor) {
    return null
  }

  if (isEmpty) {
    return (
      <div className={cn("text-muted-foreground italic p-4", className)}>
        Aucun contenu
      </div>
    )
  }

  return (
    <div className={cn("rich-text-display", className)}>
      <EditorContent editor={editor} />
    </div>
  )
}
