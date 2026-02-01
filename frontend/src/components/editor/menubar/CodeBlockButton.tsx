import { Editor } from '@tiptap/react'
import { Code2 } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

interface CodeBlockButtonProps {
  editor: Editor
}

export function CodeBlockButton({ editor }: Readonly<CodeBlockButtonProps>) {
  return (
    <Toggle
      size="sm"
      pressed={editor.isActive('codeBlock')}
      onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
      aria-label="Bloc de code"
    >
      <Code2 className="h-4 w-4" />
    </Toggle>
  )
}
