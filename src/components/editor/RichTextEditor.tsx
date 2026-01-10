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
  placeholder = "Commencez à écrire...",
  editable = true,
  className,
  noteId,
}: Readonly<RichTextEditorProps>) {
  const { editor, collabUsers } = useRichTextEditor({
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
      {!!collabUsers.length && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Connectes :</span>
          {collabUsers.map((userItem, index) => (
            <span
              key={`${userItem.id ?? userItem.name}-${index}`}
              className="inline-flex items-center gap-2 text-xs"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: userItem.color ?? "transparent" }}
              />
              <span className="max-w-[140px] truncate">{userItem.name}</span>
            </span>
          ))}
        </div>
      )}
      {editable && <MenuBar editor={editor} noteId={noteId} />}
      <EditorContent editor={editor} />
    </div>
  )
}
