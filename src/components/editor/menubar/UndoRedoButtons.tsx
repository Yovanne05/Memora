import { Editor } from '@tiptap/react'
import { Undo, Redo } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

interface UndoRedoButtonsProps {
  editor: Editor
}

export function UndoRedoButtons({ editor }: Readonly<UndoRedoButtonsProps>) {
  return (
    <>
      <Toggle
        size="sm"
        pressed={false}
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Annuler"
      >
        <Undo className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={false}
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Rétablir"
      >
        <Redo className="h-4 w-4" />
      </Toggle>
    </>
  )
}
