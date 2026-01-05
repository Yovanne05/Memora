import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import { common, createLowlight } from 'lowlight'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import './editor.css'

const lowlight = createLowlight(common)

interface RichTextDisplayProps {
  content: string
  className?: string
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

export function RichTextDisplay({ content, className }: Readonly<RichTextDisplayProps>) {
  const parsedContent = useMemo(() => {
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
  }, [content])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
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
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content: parsedContent,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none',
          'prose-headings:font-semibold prose-headings:tracking-tight',
          'prose-p:leading-relaxed prose-p:text-muted-foreground',
          'prose-a:text-primary prose-a:underline prose-a:cursor-pointer',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-muted prose-pre:p-4',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:text-muted-foreground',
          'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
          'prose-strong:font-semibold prose-strong:text-foreground',
          'prose-em:italic',
          'prose-img:rounded-lg prose-img:shadow-md prose-img:my-4',
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  if (!content || content.trim().length === 0) {
    return (
      <div className={cn('text-muted-foreground italic p-4', className)}>
        Aucun contenu
      </div>
    )
  }

  return (
    <div className={cn('rich-text-display', className)}>
      <EditorContent editor={editor} />
    </div>
  )
}
