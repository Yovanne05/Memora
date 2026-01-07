import { Editor } from '@tiptap/react'
import { List, ListOrdered, Quote } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

interface ListButtonsProps {
  editor: Editor
}

export function ListButtons({ editor }: Readonly<ListButtonsProps>) {
  return (
    <>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Liste à puces"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Liste numérotée"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('blockquote')}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Citation"
      >
        <Quote className="h-4 w-4" />
      </Toggle>
    </>
  )
}
