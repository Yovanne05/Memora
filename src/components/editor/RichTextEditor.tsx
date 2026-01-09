import { EditorContent } from "@tiptap/react"

import { cn } from "@/lib/utils"
import { MenuBar } from "./MenuBar"
import { useRichTextEditor } from "../../hooks/useRichTextEditor"
import "./editor.css"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
  noteId?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Commencez � �crire...",
  editable = true,
  className,
  noteId,
}: Readonly<RichTextEditorProps>) {
  const editor = useRichTextEditor({
    content,
    onChange,
    placeholder,
    editable,
    noteId,
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      {editable && <MenuBar editor={editor} noteId={noteId} />}
      <EditorContent editor={editor} />
    </div>
  )
}
