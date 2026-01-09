import { useEffect, useRef, useCallback, useState } from 'react'
import { Editor } from '@tiptap/react'
import { useCollaboration } from '@/features/collaboration/hooks/useCollaboration'
import type {
  CollaborationOperation,
  CollaborationEvent,
} from '@/features/collaboration/types/collaboration'
import { logger } from '@/lib/logger'
import { parseContent } from '@/lib/content'
import { getCurrentUserId } from '@/features/auth/lib/token-storage'

interface UseCollaborativeEditorOptions {
  editor: Editor | null
  noteId: string
  enabled?: boolean
  onContentChanged?: (content: string) => void
}

export function useCollaborativeEditor({
  editor,
  noteId,
  enabled = true,
  onContentChanged,
}: UseCollaborativeEditorOptions) {
  const isApplyingRemoteChange = useRef(false)
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [cursors, setCursors] = useState<Map<string, number>>(new Map())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastContentRef = useRef<string>('')
  const [initialContent, setInitialContent] = useState<string>('')

  const serializeEditorContent = useCallback((activeEditor: Editor) => {
    return JSON.stringify(activeEditor.getJSON())
  }, [])

  const applyOperationToContent = useCallback(
    (content: string, operation: CollaborationOperation) => {
      switch (operation.operation_type) {
        case 'insert': {
          return (
            content.slice(0, operation.position) +
            operation.content +
            content.slice(operation.position)
          )
        }
        case 'delete': {
          const endPos = operation.position + (operation.length || 0)
          return content.slice(0, operation.position) + content.slice(endPos)
        }
        case 'replace': {
          const endPos = operation.position + (operation.length || 0)
          return (
            content.slice(0, operation.position) +
            operation.content +
            content.slice(endPos)
          )
        }
        default:
          return content
      }
    },
    []
  )

  const diffToOperation = useCallback(
    (prev: string, next: string): CollaborationOperation | null => {
      if (prev === next) {
        return null
      }

      let start = 0
      while (
        start < prev.length &&
        start < next.length &&
        prev[start] === next[start]
      ) {
        start++
      }

      let endPrev = prev.length - 1
      let endNext = next.length - 1
      while (
        endPrev >= start &&
        endNext >= start &&
        prev[endPrev] === next[endNext]
      ) {
        endPrev--
        endNext--
      }

      const removed = prev.slice(start, endPrev + 1)
      const added = next.slice(start, endNext + 1)

      if (removed.length === 0 && added.length === 0) {
        return null
      }

      if (removed.length === 0) {
        return {
          operation_type: 'insert',
          position: start,
          content: added,
          version: 0,
        }
      }

      if (added.length === 0) {
        return {
          operation_type: 'delete',
          position: start,
          content: '',
          length: removed.length,
          version: 0,
        }
      }

      return {
        operation_type: 'replace',
        position: start,
        content: added,
        length: removed.length,
        version: 0,
      }
    },
    []
  )

  const handleOperationReceived = useCallback(
    (operation: CollaborationOperation, event: CollaborationEvent) => {
      const currentUserId = getCurrentUserId()
      if (!editor || event.user_id === currentUserId) {
        logger.info('Skipping own operation', {
          currentUserId,
          eventUserId: event.user_id,
        })
        return
      }

      logger.info('Applying remote operation', { operation, event })
      isApplyingRemoteChange.current = true

      try {
        // For 'replace' type with full document, use the content directly
        if (
          operation.operation_type === 'replace' &&
          operation.position === 0 &&
          operation.content
        ) {
          lastContentRef.current = operation.content
          editor.commands.setContent(parseContent(operation.content))
          onContentChanged?.(operation.content)
        } else {
          // Legacy support for other operation types
          const baseContent =
            lastContentRef.current || serializeEditorContent(editor)
          const nextContent = applyOperationToContent(baseContent, operation)
          lastContentRef.current = nextContent
          editor.commands.setContent(parseContent(nextContent))
          onContentChanged?.(nextContent)
        }
      } catch (error) {
        logger.error('Failed to apply remote operation', { error, operation })
      } finally {
        isApplyingRemoteChange.current = false
      }
    },
    [editor, onContentChanged, applyOperationToContent, serializeEditorContent]
  )

  const handleUserJoined = useCallback((event: CollaborationEvent) => {
    logger.info('User joined collaboration', { username: event.username })
    setActiveUsers((prev) => [...prev, event.username])
  }, [])

  const handleUserLeft = useCallback((event: CollaborationEvent) => {
    logger.info('User left collaboration', { username: event.username })
    setActiveUsers((prev) => prev.filter((u) => u !== event.username))
    setCursors((prev) => {
      const newCursors = new Map(prev)
      newCursors.delete(event.user_id)
      return newCursors
    })
    setTypingUsers((prev) => {
      const newTyping = new Set(prev)
      newTyping.delete(event.username)
      return newTyping
    })
  }, [])

  const handleCursorMoved = useCallback(
    (cursor: { user_id: string; username: string; position: number }) => {
      setCursors((prev) => {
        const newCursors = new Map(prev)
        newCursors.set(cursor.user_id, cursor.position)
        return newCursors
      })
    },
    []
  )

  const handleTypingStatusChanged = useCallback(
    (status: { user_id: string; username: string; is_typing: boolean }) => {
      setTypingUsers((prev) => {
        const newTyping = new Set(prev)
        if (status.is_typing) {
          newTyping.add(status.username)
        } else {
          newTyping.delete(status.username)
        }
        return newTyping
      })
    },
    []
  )

  useEffect(() => {
    if (!editor) {
      return
    }
    const serialized = serializeEditorContent(editor)
    lastContentRef.current = serialized
    setInitialContent(serialized)
  }, [editor, serializeEditorContent])

  const {
    isConnected,
    isConnecting,
    session,
    error,
    sendOperation,
    updateCursorPosition,
    setTypingStatus,
    reconnect,
    disconnect,
  } = useCollaboration({
    noteId,
    enabled: enabled && !!initialContent,
    initialContent,
    onOperationReceived: handleOperationReceived,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onCursorMoved: handleCursorMoved,
    onTypingStatusChanged: handleTypingStatusChanged,
    onSessionUpdated: (newSession) => {
      setActiveUsers(newSession.collaborators.map((c) => c.username))
      if (newSession.content) {
        lastContentRef.current = newSession.content
        if (editor) {
          editor.commands.setContent(parseContent(newSession.content))
        }
      }
    },
  })

  useEffect(() => {
    if (!editor || !isConnected || !session) {
      return
    }

    const handleUpdate = () => {
      if (isApplyingRemoteChange.current) {
        return
      }

      const content = serializeEditorContent(editor)
      const previousContent = lastContentRef.current
      if (!previousContent) {
        lastContentRef.current = content
        return
      }

      // Send full document as a replace operation instead of diffs
      // This is simpler and more reliable for JSON content
      const operation: Omit<CollaborationOperation, 'version'> = {
        operation_type: 'replace',
        position: 0,
        content,
        length: previousContent.length,
      }

      logger.info('Sending full document operation', {
        contentLength: content.length,
        previousLength: previousContent.length,
      })
      sendOperation(operation)
      lastContentRef.current = content
      const { from } = editor.state.selection

      logger.info('Local editor update', {
        contentLength: content.length,
        cursorPosition: from,
      })

      setTypingStatus(true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false)
      }, 1000)
    }

    const handleSelectionUpdate = () => {
      if (isApplyingRemoteChange.current) {
        return
      }

      const { from } = editor.state.selection
      updateCursorPosition(from)
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleSelectionUpdate)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleSelectionUpdate)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [
    editor,
    isConnected,
    session,
    sendOperation,
    updateCursorPosition,
    setTypingStatus,
    diffToOperation,
    serializeEditorContent,
  ])

  useEffect(() => {
    if (!editor) {
      return
    }
    lastContentRef.current = serializeEditorContent(editor)
  }, [editor, serializeEditorContent])

  return {
    isConnected,
    isConnecting,
    session,
    error,
    activeUsers,
    cursors,
    typingUsers,
    reconnect,
    disconnect,
  }
}
