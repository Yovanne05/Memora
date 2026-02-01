import { Editor } from '@tiptap/react'
import { Heading1, Heading2, Heading3 } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

interface HeadingButtonsProps {
  editor: Editor
}

export function HeadingButtons({ editor }: Readonly<HeadingButtonsProps>) {
  return (
    <>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-label="Titre 1"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Titre 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-label="Titre 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
    </>
  )
}
