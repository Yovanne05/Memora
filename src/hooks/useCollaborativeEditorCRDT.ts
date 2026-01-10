import { useEffect, useRef, useState, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import { useCollaborationCRDT } from '@/features/collaboration/hooks/useCollaborationCRDT'
import { YjsTiptapBinding } from '@/features/collaboration/lib/yjs-tiptap-binding'

type ActiveUser = {
  userId: string
  username: string
}

interface UseCollaborativeEditorCRDTOptions {
  editor: Editor | null
  noteId: string
  enabled?: boolean
  onContentChanged?: (content: string) => void
}

export function useCollaborativeEditorCRDT({
  editor,
  noteId,
  enabled = true,
  onContentChanged,
}: UseCollaborativeEditorCRDTOptions) {
  const [localError, setLocalError] = useState<Error | null>(null)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const bindingRef = useRef<YjsTiptapBinding | null>(null)

  const handleUserJoined = useCallback(
    (event: { user_id: string; username: string }) => {
      setActiveUsers((prev) => {
        if (prev.some((user) => user.userId === event.user_id)) {
          return prev
        }
        return [...prev, { userId: event.user_id, username: event.username }]
      })
    },
    []
  )

  const handleUserLeft = useCallback(
    (event: { user_id: string; username: string }) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== event.user_id))
      setTypingUsers((prev) => {
        const newTyping = new Set(prev)
        newTyping.delete(event.username)
        return newTyping
      })
    },
    []
  )

  const handleError = useCallback((error: Error) => {
    setLocalError(error)
  }, [])

  const {
    doc,
    isConnected,
    isConnecting,
    isSynced,
    session,
    error: collaborationError,
    reconnect,
    disconnect,
  } = useCollaborationCRDT({
    noteId,
    enabled: enabled && !!editor,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onSessionUpdated: (newSession) => {
      setActiveUsers(
        newSession.collaborators.map((c) => ({
          userId: c.user_id,
          username: c.username,
        }))
      )
    },
    onError: handleError,
  })

  // Créer le binding entre Yjs et Tiptap
  useEffect(() => {
    if (!doc || !editor || !isConnected || !isSynced) {
      return
    }

    // Créer le binding
    bindingRef.current = new YjsTiptapBinding(doc, editor)

    // Optionnel: Notifier les changements de contenu
    const handleUpdate = () => {
      const content = JSON.stringify(editor.getJSON())
      onContentChanged?.(content)
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      if (bindingRef.current) {
        bindingRef.current.destroy()
        bindingRef.current = null
      }
    }
  }, [doc, editor, isConnected, isSynced, onContentChanged])

  return {
    isConnected,
    isConnecting,
    isSynced,
    session,
    error: localError ?? collaborationError,
    activeUsers,
    cursors: new Map(),
    typingUsers,
    reconnect,
    disconnect,
  }
}
