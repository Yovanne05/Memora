import { useEffect, useRef, useState, useCallback } from 'react'
import * as Y from 'yjs'
import { useLatest } from '@/hooks/useLatest'
import { useSocket } from './useSocket'
import { useYjsProvider } from './useYjsProvider'
import {
  handleCollaborationEvent,
  handleSessionUpdate,
} from '../lib/collaboration-handlers'
import type { CollaborationSession } from '../types/collaboration'

export type UseCollaborationCRDTOptions = {
  noteId: string
  enabled?: boolean
  initialContent?: string | null
  onSynced?: () => void
  onUserJoined?: (event: { user_id: string; username: string }) => void
  onUserLeft?: (event: { user_id: string; username: string }) => void
  onSessionUpdated?: (session: CollaborationSession) => void
  onError?: (error: Error) => void
}

export type UseCollaborationCRDTReturn = {
  doc: Y.Doc | null
  isConnected: boolean
  isConnecting: boolean
  isSynced: boolean
  session: CollaborationSession | null
  error: Error | null
  reconnect: () => void
  disconnect: () => void
}

export function useCollaborationCRDT(
  options: UseCollaborationCRDTOptions
): UseCollaborationCRDTReturn {
  const {
    noteId,
    enabled = true,
    initialContent = null,
    onSynced,
    onUserJoined,
    onUserLeft,
    onSessionUpdated,
    onError,
  } = options

  const [session, setSession] = useState<CollaborationSession | null>(null)
  const hasJoinedRef = useRef(false)

  const onUserJoinedRef = useLatest(onUserJoined)
  const onUserLeftRef = useLatest(onUserLeft)
  const onSessionUpdatedRef = useLatest(onSessionUpdated)

  const handleDisconnect = useCallback(() => {
    hasJoinedRef.current = false
    setSession(null)
  }, [])

  const { socket, isConnected, isConnecting, error, disconnect, connect } =
    useSocket({
      enabled,
      onDisconnect: handleDisconnect,
      onError,
    })

  const { doc, isSynced } = useYjsProvider({
    socket,
    noteId,
    isConnected,
    initialContent,
    onSynced,
    onError,
  })

  const handleLeave = useCallback(() => {
    if (socket) {
      socket.emit('leave_collaboration', { note_id: noteId })
    }
    disconnect()
  }, [socket, noteId, disconnect])

  const reconnect = useCallback(() => {
    handleLeave()
    connect()
  }, [handleLeave, connect])

  useEffect(() => {
    if (!socket || !isConnected) return

    if (!hasJoinedRef.current) {
      socket.emit('join_collaboration', {
        note_id: noteId,
        content: initialContent ?? undefined,
      })
      hasJoinedRef.current = true
    }

    const sessionHandler = (sessionData: CollaborationSession) => {
      handleSessionUpdate(sessionData, {
        onSessionChange: setSession,
        onSessionUpdated: onSessionUpdatedRef.current,
      })
    }

    const eventHandler = (
      event: Parameters<typeof handleCollaborationEvent>[0]
    ) => {
      handleCollaborationEvent(event, {
        onUserJoined: onUserJoinedRef.current,
        onUserLeft: onUserLeftRef.current,
      })
    }

    socket.on('collaboration_session', sessionHandler)
    socket.on('collaboration_event', eventHandler)

    return () => {
      socket.off('collaboration_session', sessionHandler)
      socket.off('collaboration_event', eventHandler)
    }
  }, [
    socket,
    isConnected,
    noteId,
    initialContent,
    onUserJoinedRef,
    onUserLeftRef,
    onSessionUpdatedRef,
  ])

  return {
    doc,
    isConnected,
    isConnecting,
    isSynced,
    session,
    error,
    reconnect,
    disconnect: handleLeave,
  }
}
