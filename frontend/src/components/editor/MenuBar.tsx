import { Editor } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import { UndoRedoButtons } from './menubar/UndoRedoButtons'
import { FormattingButtons } from './menubar/FormattingButtons'
import { HeadingButtons } from './menubar/HeadingButtons'
import { ListButtons } from './menubar/ListButtons'
import { AlignmentButtons } from './menubar/AlignmentButtons'
import { LinkButton } from './menubar/LinkButton'
import { ImageUploadButton } from './menubar/ImageUploadButton'
import { CodeBlockButton } from './menubar/CodeBlockButton'

interface MenuBarProps {
  editor: Editor
  noteId?: string
}

/**
 * Barre d'outils de l'éditeur rich text
 * Refactorisé en composants modulaires pour une meilleure maintenabilité
 */
export function MenuBar({ editor, noteId }: Readonly<MenuBarProps>) {
  return (
    <div className="border-b border-border bg-muted/30 p-2 flex flex-wrap gap-1">
      <UndoRedoButtons editor={editor} />
      <Separator orientation="vertical" className="mx-1 h-8" />

      <FormattingButtons editor={editor} />
      <Separator orientation="vertical" className="mx-1 h-8" />

      <HeadingButtons editor={editor} />
      <Separator orientation="vertical" className="mx-1 h-8" />

      <ListButtons editor={editor} />
      <Separator orientation="vertical" className="mx-1 h-8" />

      <AlignmentButtons editor={editor} />
      <Separator orientation="vertical" className="mx-1 h-8" />

      <CodeBlockButton editor={editor} />
      <LinkButton editor={editor} />
      <ImageUploadButton editor={editor} noteId={noteId} />
    </div>
  )
}
