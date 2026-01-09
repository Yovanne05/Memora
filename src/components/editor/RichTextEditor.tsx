import { EditorContent } from '@tiptap/react'

import { cn } from '@/lib/utils'
import { MenuBar } from './MenuBar'
import { useRichTextEditor } from '../../hooks/useRichTextEditor'
import { useCollaborativeEditor } from '../../hooks/useCollaborativeEditor'
import { CollaborationStatus } from '@/features/collaboration/components/CollaborationStatus'
import './editor.css'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
  noteId?: string
  enableCollaboration?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Commencez à écrire...',
  editable = true,
  className,
  noteId,
  enableCollaboration = false,
}: Readonly<RichTextEditorProps>) {
  const editor = useRichTextEditor({
    content,
    onChange,
    placeholder,
    editable,
  })

  const collaboration = useCollaborativeEditor({
    editor,
    noteId: noteId || '',
    enabled: enableCollaboration && editable && !!noteId,
    onContentChanged: onChange,
  })

  if (!editor) {
    return null
  }

  return (
    <div
      className={cn(
        'border border-border rounded-lg overflow-hidden',
        className
      )}
    >
      {editable && <MenuBar editor={editor} noteId={noteId} />}
      {enableCollaboration && noteId && (
        <CollaborationStatus
          isConnected={collaboration.isConnected}
          isConnecting={collaboration.isConnecting}
          activeUsers={collaboration.activeUsers}
          typingUsers={collaboration.typingUsers}
          error={collaboration.error}
          onReconnect={collaboration.reconnect}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
