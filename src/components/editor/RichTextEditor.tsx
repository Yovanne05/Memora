import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ResizableImage } from './extensions/ResizableImage'
import { common, createLowlight } from 'lowlight'
import { MenuBar } from './MenuBar'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import './editor.css'

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
  noteId?: string
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

function parseContent(content: string) {
  if (!content || content.trim().length === 0) {
    return ''
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

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Commencez à écrire...",
  editable = true,
  className,
  noteId
}: Readonly<RichTextEditorProps>) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-muted rounded-md p-4 font-mono text-sm',
        },
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content: parseContent(content),
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange(JSON.stringify(json))
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
          'prose-headings:font-semibold prose-headings:tracking-tight',
          'prose-p:leading-relaxed prose-p:text-muted-foreground',
          'prose-a:text-primary prose-a:underline prose-a:cursor-pointer',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
          'prose-pre:bg-muted prose-pre:p-4',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:text-muted-foreground',
          'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
          'prose-img:rounded-lg prose-img:shadow-md prose-img:my-4',
        ),
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    const currentContent = JSON.stringify(editor.getJSON())
    const newContent = parseContent(content)

    if (typeof newContent === 'string') {
      if (currentContent !== newContent) {
        editor.commands.setContent(newContent)
      }
    } else {
      const newContentStr = JSON.stringify(newContent)
      if (currentContent !== newContentStr) {
        editor.commands.setContent(newContent)
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      {editable && <MenuBar editor={editor} noteId={noteId} />}
      <EditorContent editor={editor} />
    </div>
  )
}
