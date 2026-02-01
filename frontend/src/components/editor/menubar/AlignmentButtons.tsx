import { Editor } from '@tiptap/react'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

interface AlignmentButtonsProps {
  editor: Editor
}

export function AlignmentButtons({ editor }: Readonly<AlignmentButtonsProps>) {
  return (
    <>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        aria-label="Aligner à gauche"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        aria-label="Centrer"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        aria-label="Aligner à droite"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
    </>
  )
}
