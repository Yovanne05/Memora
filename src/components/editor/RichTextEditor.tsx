import { EditorContent } from '@tiptap/react'

import { cn } from '@/lib/utils'
import { MenuBar } from './MenuBar'
import { useRichTextEditor } from '../../hooks/useRichTextEditor'
import { useCollaborativeEditorCRDT } from '../../hooks/useCollaborativeEditorCRDT'
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
  const { editor } = useRichTextEditor({
    content,
    onChange,
    placeholder,
    editable,
  })

  const collaboration = useCollaborativeEditorCRDT({
    editor,
    noteId: noteId || '',
    enabled: enableCollaboration && !!noteId,
    content,
    onContentChanged: onChange,
  })

  if (!editor) {
    return null
  }

  return (
    <div
      className={cn(
        'w-full max-w-full overflow-hidden rounded-lg border border-border',
        !editable && 'bg-muted/50',
        className
      )}
    >
      {editable && <MenuBar editor={editor} noteId={noteId} />}
      {enableCollaboration && noteId && editable && (
        <CollaborationStatus
          isConnected={collaboration.isConnected}
          isConnecting={collaboration.isConnecting}
          isSynced={collaboration.isSynced}
          activeUsers={collaboration.activeUsers}
          typingUsers={collaboration.typingUsers}
          error={collaboration.error}
          onReconnect={collaboration.reconnect}
        />
      )}
      <EditorContent
        editor={editor}
        className={cn('min-h-[800px]', !editable && 'cursor-not-allowed')}
      />
    </div>
  )
}
