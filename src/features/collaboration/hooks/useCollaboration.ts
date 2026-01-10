import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { config } from '@/lib/config'
import { getAccessToken } from '@/features/auth/lib/token-storage'
import { useLatest } from '@/hooks/useLatest'
import type {
  CollaborationOperation,
  CollaborationSession,
} from '../types/collaboration'
import {
  SOCKET_EVENTS,
  SOCKET_PATH,
  RECONNECTION_DELAY,
  MAX_RECONNECTION_ATTEMPTS,
} from '../lib/socket-events'
import { useOperationQueue } from './useOperationQueue'
import { useCollaborationHandlers } from './useCollaborationHandlers'
import type { UseCollaborationOptions, UseCollaborationReturn } from './types'

export function useCollaboration(
  options: UseCollaborationOptions
): UseCollaborationReturn {
  const {
    noteId,
    enabled = true,
    initialContent,
    onOperationReceived,
    onUserJoined,
    onUserLeft,
    onCursorMoved,
    onTypingStatusChanged,
    onSessionUpdated,
    onError,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [session, setSession] = useState<CollaborationSession | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const reconnectionAttemptsRef = useRef(0)
  const currentVersionRef = useRef(0)
  const initialContentRef = useLatest(initialContent)
  const onOperationReceivedRef = useLatest(onOperationReceived)
  const onUserJoinedRef = useLatest(onUserJoined)
  const onUserLeftRef = useLatest(onUserLeft)
  const onCursorMovedRef = useLatest(onCursorMoved)
  const onTypingStatusChangedRef = useLatest(onTypingStatusChanged)
  const onSessionUpdatedRef = useLatest(onSessionUpdated)
  const onErrorRef = useLatest(onError)

  const isFullDocumentReplace = useCallback(
    (
      operation:
        | CollaborationOperation
        | Omit<CollaborationOperation, 'version'>
    ) => operation.operation_type === 'replace' && operation.position === 0,
    []
  )

  const updateCurrentVersion = useCallback((version: number) => {
    currentVersionRef.current = version
  }, [])

  const emitIfConnected = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      const socket = socketRef.current
      if (!socket?.connected) {
        return false
      }
      socket.emit(event, payload)
      return true
    },
    []
  )

  const {
    enqueueOperation,
    processQueue,
    handleOperationAcknowledged,
    handleVersionConflict,
    resetQueue,
  } = useOperationQueue({
    noteId,
    socketRef,
    currentVersionRef,
    updateCurrentVersion,
    isFullDocumentReplace,
  })

  const { handleSessionUpdate, handleCollaborationEvent, handleSocketError } =
    useCollaborationHandlers({
      currentVersionRef,
      updateCurrentVersion,
      processQueue,
      setSession,
      setError,
      onSessionUpdatedRef,
      onOperationReceivedRef,
      onUserJoinedRef,
      onUserLeftRef,
      onCursorMovedRef,
      onTypingStatusChangedRef,
      onErrorRef,
      handleVersionConflict,
    })

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return
    }

    setIsConnecting(true)
    setError(null)

    const token = getAccessToken()
    if (!token) {
      const authError = new Error('No authentication token found')
      setError(authError)
      setIsConnecting(false)
      onErrorRef.current?.(authError)
      return
    }

    const apiUrl = config.apiUrl || 'http://localhost:5000'
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const socketUrl = `${baseUrl}${SOCKET_PATH}`

    const socket = io(socketUrl, {
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionDelay: RECONNECTION_DELAY,
      reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
      transports: ['polling'],
      upgrade: false,
    })

    socket.on(SOCKET_EVENTS.connect, () => {
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
      reconnectionAttemptsRef.current = 0

      socket.emit(SOCKET_EVENTS.join, {
        note_id: noteId,
        content: initialContentRef.current,
      })
    })

    socket.on(SOCKET_EVENTS.disconnect, () => {
      setIsConnected(false)
      setSession(null)

      // Clear operation queue on disconnect
      resetQueue()
    })

    socket.on(SOCKET_EVENTS.connectError, (err) => {
      setError(err)
      setIsConnecting(false)
      onErrorRef.current?.(err)
      reconnectionAttemptsRef.current++

      if (reconnectionAttemptsRef.current >= MAX_RECONNECTION_ATTEMPTS) {
        socket.close()
      }
    })

    socket.on(SOCKET_EVENTS.session, handleSessionUpdate)
    socket.on(SOCKET_EVENTS.event, handleCollaborationEvent)
    socket.on(SOCKET_EVENTS.operationAcknowledged, handleOperationAcknowledged)
    socket.on(SOCKET_EVENTS.error, handleSocketError)

    socketRef.current = socket
  }, [
    noteId,
    handleSessionUpdate,
    handleCollaborationEvent,
    handleOperationAcknowledged,
    handleSocketError,
    initialContentRef,
    onErrorRef,
    resetQueue,
  ])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      emitIfConnected(SOCKET_EVENTS.leave, { note_id: noteId })
      socketRef.current.close()
      socketRef.current = null
      setIsConnected(false)
      setIsConnecting(false)
      setSession(null)
      resetQueue()
    }
  }, [emitIfConnected, noteId, resetQueue])

  const sendOperation = useCallback(
    (operation: Omit<CollaborationOperation, 'version'>) => {
      enqueueOperation(operation)
    },
    [enqueueOperation]
  )

  const updateCursorPosition = useCallback(
    (position: number) => {
      emitIfConnected(SOCKET_EVENTS.cursorPosition, {
        note_id: noteId,
        position,
      })
    },
    [emitIfConnected, noteId]
  )

  const setTypingStatus = useCallback(
    (isTyping: boolean) => {
      emitIfConnected(SOCKET_EVENTS.typingStatus, {
        note_id: noteId,
        is_typing: isTyping,
      })
    },
    [emitIfConnected, noteId]
  )

  const reconnect = useCallback(() => {
    disconnect()
    reconnectionAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (enabled) {
        connect()
      } else {
        disconnect()
      }
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    isConnecting,
    session,
    error,
    sendOperation,
    updateCursorPosition,
    setTypingStatus,
    reconnect,
    disconnect,
  }
}
