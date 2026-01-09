import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { logger } from '@/lib/logger'
import { config } from '@/lib/config'
import { getAccessToken } from '@/features/auth/lib/token-storage'
import type {
  CollaborationOperation,
  CollaborationEvent,
  CollaborationSession,
  CursorPosition,
  TypingStatus,
} from '../types/collaboration'

interface UseCollaborationOptions {
  noteId: string
  enabled?: boolean
  initialContent?: string
  onOperationReceived?: (
    operation: CollaborationOperation,
    event: CollaborationEvent
  ) => void
  onUserJoined?: (event: CollaborationEvent) => void
  onUserLeft?: (event: CollaborationEvent) => void
  onCursorMoved?: (cursor: CursorPosition) => void
  onTypingStatusChanged?: (status: TypingStatus) => void
  onSessionUpdated?: (session: CollaborationSession) => void
  onError?: (error: Error) => void
}

interface UseCollaborationReturn {
  isConnected: boolean
  isConnecting: boolean
  session: CollaborationSession | null
  error: Error | null
  sendOperation: (operation: Omit<CollaborationOperation, 'version'>) => void
  updateCursorPosition: (position: number) => void
  setTypingStatus: (isTyping: boolean) => void
  reconnect: () => void
  disconnect: () => void
}

const SOCKET_PATH = '/collaboration'
const RECONNECTION_DELAY = 1000
const MAX_RECONNECTION_ATTEMPTS = 5

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
  const [currentVersion, setCurrentVersion] = useState(0)

  const socketRef = useRef<Socket | null>(null)
  const reconnectionAttemptsRef = useRef(0)
  const initialContentRef = useRef(initialContent)
  const onOperationReceivedRef = useRef(onOperationReceived)
  const onUserJoinedRef = useRef(onUserJoined)
  const onUserLeftRef = useRef(onUserLeft)
  const onCursorMovedRef = useRef(onCursorMoved)
  const onTypingStatusChangedRef = useRef(onTypingStatusChanged)
  const onSessionUpdatedRef = useRef(onSessionUpdated)
  const onErrorRef = useRef(onError)

  // Operation queue for sequential processing
  const operationQueueRef = useRef<
    Array<Omit<CollaborationOperation, 'version'>>
  >([])
  const isProcessingQueueRef = useRef(false)
  const pendingOperationRef = useRef<CollaborationOperation | null>(null)

  useEffect(() => {
    onOperationReceivedRef.current = onOperationReceived
  }, [onOperationReceived])

  useEffect(() => {
    onUserJoinedRef.current = onUserJoined
  }, [onUserJoined])

  useEffect(() => {
    onUserLeftRef.current = onUserLeft
  }, [onUserLeft])

  useEffect(() => {
    onCursorMovedRef.current = onCursorMoved
  }, [onCursorMoved])

  useEffect(() => {
    onTypingStatusChangedRef.current = onTypingStatusChanged
  }, [onTypingStatusChanged])

  useEffect(() => {
    onSessionUpdatedRef.current = onSessionUpdated
  }, [onSessionUpdated])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    initialContentRef.current = initialContent
  }, [initialContent])

  // Declare processOperationQueue before connect to avoid hoisting issues
  const processOperationQueueRef = useRef<(() => void) | null>(null)

  const processOperationQueue = useCallback(() => {
    if (isProcessingQueueRef.current || !socketRef.current?.connected) {
      return
    }

    const nextOperation = operationQueueRef.current.shift()
    if (!nextOperation) {
      isProcessingQueueRef.current = false
      return
    }

    isProcessingQueueRef.current = true

    const fullOperation: CollaborationOperation = {
      ...nextOperation,
      version: currentVersion + 1,
    }

    pendingOperationRef.current = fullOperation

    logger.info('Sending operation from queue', {
      operation: fullOperation,
      queueLength: operationQueueRef.current.length,
      noteId,
    })

    socketRef.current.emit('send_operation', {
      note_id: noteId,
      operation: fullOperation,
    })
  }, [noteId, currentVersion])

  // Store in ref for stable reference in socket handlers
  useEffect(() => {
    processOperationQueueRef.current = processOperationQueue
  }, [processOperationQueue])

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return
    }

    setIsConnecting(true)
    setError(null)

    const token = getAccessToken()
    if (!token) {
      const authError = new Error('No authentication token found')
      logger.error('Collaboration connection failed: No auth token', { noteId })
      setError(authError)
      setIsConnecting(false)
      onErrorRef.current?.(authError)
      return
    }

    const apiUrl = config.apiUrl || 'http://localhost:5000'
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const socketUrl = `${baseUrl}${SOCKET_PATH}`

    logger.info('Connecting to collaboration server', {
      wsUrl: socketUrl,
      noteId,
    })

    const socket = io(socketUrl, {
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionDelay: RECONNECTION_DELAY,
      reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
      transports: ['polling'],
      upgrade: false,
    })

    socket.on('connect', () => {
      logger.info('Connected to collaboration server', {
        socketId: socket.id,
        noteId,
      })
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
      reconnectionAttemptsRef.current = 0

      socket.emit('join_collaboration', {
        note_id: noteId,
        content: initialContentRef.current,
      })
    })

    socket.on('disconnect', (reason) => {
      logger.warn('Disconnected from collaboration server', { reason, noteId })
      setIsConnected(false)
      setSession(null)

      // Clear operation queue on disconnect
      if (operationQueueRef.current.length > 0) {
        logger.warn('Clearing operation queue due to disconnect', {
          queueLength: operationQueueRef.current.length,
        })
        operationQueueRef.current = []
        pendingOperationRef.current = null
        isProcessingQueueRef.current = false
      }
    })

    socket.on('connect_error', (err) => {
      logger.error('Collaboration connection error', {
        error: err.message,
        noteId,
      })
      setError(err)
      setIsConnecting(false)
      onErrorRef.current?.(err)
      reconnectionAttemptsRef.current++

      if (reconnectionAttemptsRef.current >= MAX_RECONNECTION_ATTEMPTS) {
        logger.error('Max reconnection attempts reached', { noteId })
        socket.close()
      }
    })

    socket.on('collaboration_session', (sessionData: CollaborationSession) => {
      logger.info('Collaboration session received', { session: sessionData })
      setSession(sessionData)
      if (typeof sessionData.version === 'number') {
        const prevVersion = currentVersion
        setCurrentVersion(sessionData.version)

        // If version changed and we have pending operations, retry queue
        if (
          prevVersion !== sessionData.version &&
          operationQueueRef.current.length > 0
        ) {
          logger.info('Version updated via session, processing queue', {
            prevVersion,
            newVersion: sessionData.version,
            queueLength: operationQueueRef.current.length,
          })
          processOperationQueueRef.current?.()
        }
      }
      onSessionUpdatedRef.current?.(sessionData)
    })

    socket.on('collaboration_event', (event: CollaborationEvent) => {
      logger.info('Received collaboration event', { event })

      switch (event.event_type) {
        case 'user_joined':
          onUserJoinedRef.current?.(event)
          break
        case 'user_left':
          onUserLeftRef.current?.(event)
          break
        case 'content_changed':
          if (event.operation) {
            setCurrentVersion(event.operation.version)
            onOperationReceivedRef.current?.(event.operation, event)
          }
          break
        case 'cursor_moved':
          if (event.cursor_position !== undefined) {
            onCursorMovedRef.current?.({
              user_id: event.user_id,
              username: event.username,
              position: event.cursor_position,
            })
          }
          break
        case 'user_typing':
          onTypingStatusChangedRef.current?.({
            user_id: event.user_id,
            username: event.username,
            is_typing: true,
          })
          break
        case 'user_stopped_typing':
          onTypingStatusChangedRef.current?.({
            user_id: event.user_id,
            username: event.username,
            is_typing: false,
          })
          break
      }
    })

    socket.on('operation_acknowledged', (data: { version: number }) => {
      logger.info('Operation acknowledged', {
        data,
        queueLength: operationQueueRef.current.length,
      })
      setCurrentVersion(data.version)
      pendingOperationRef.current = null
      isProcessingQueueRef.current = false

      // Process next operation in queue
      processOperationQueueRef.current?.()
    })

    socket.on(
      'error',
      (errorData: { code?: number; message: string; type?: string }) => {
        const socketError = new Error(errorData.message)
        logger.error('Collaboration socket error', {
          error: errorData,
          errorType: errorData.type,
          errorCode: errorData.code,
        })

        // Handle version conflicts by retrying with updated version
        if (
          errorData.type === 'version_conflict' &&
          pendingOperationRef.current
        ) {
          logger.info(
            'Version conflict detected, will retry after version update',
            {
              pendingOperation: pendingOperationRef.current,
            }
          )

          // Re-queue the pending operation (without version)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { version, ...operationWithoutVersion } =
            pendingOperationRef.current
          operationQueueRef.current.unshift(operationWithoutVersion)

          pendingOperationRef.current = null
          isProcessingQueueRef.current = false

          // The server should send an updated session/version, which will trigger processOperationQueue
        } else {
          setError(socketError)
          onErrorRef.current?.(socketError)
        }
      }
    )

    socketRef.current = socket
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      logger.info('Disconnecting from collaboration server', { noteId })
      socketRef.current.emit('leave_collaboration', { note_id: noteId })
      socketRef.current.close()
      socketRef.current = null
      setIsConnected(false)
      setSession(null)
    }
  }, [noteId])

  const sendOperation = useCallback(
    (operation: Omit<CollaborationOperation, 'version'>) => {
      if (!socketRef.current?.connected) {
        logger.warn('Cannot send operation: not connected', { noteId })
        return
      }

      // Add operation to queue
      operationQueueRef.current.push(operation)
      logger.info('Operation added to queue', {
        queueLength: operationQueueRef.current.length,
        noteId,
      })

      // Process queue if not already processing
      processOperationQueue()
    },
    [noteId, processOperationQueue]
  )

  const updateCursorPosition = useCallback(
    (position: number) => {
      if (!socketRef.current?.connected) {
        return
      }

      socketRef.current.emit('cursor_position', {
        note_id: noteId,
        position,
      })
    },
    [noteId]
  )

  const setTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current?.connected) {
        return
      }

      socketRef.current.emit('typing_status', {
        note_id: noteId,
        is_typing: isTyping,
      })
    },
    [noteId]
  )

  const reconnect = useCallback(() => {
    disconnect()
    reconnectionAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  // Process queue when version updates and we're not already processing
  useEffect(() => {
    if (
      !isProcessingQueueRef.current &&
      operationQueueRef.current.length > 0 &&
      isConnected
    ) {
      logger.info('Version changed, processing pending operations', {
        currentVersion,
        queueLength: operationQueueRef.current.length,
      })
      processOperationQueue()
    }
  }, [currentVersion, isConnected, processOperationQueue])

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
