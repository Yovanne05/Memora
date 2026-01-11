import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import * as Y from 'yjs'
import { config } from '@/lib/config'
import { getAccessToken } from '@/features/auth/lib/token-storage'
import { useLatest } from '@/hooks/useLatest'
import {
  SOCKET_PATH,
  RECONNECTION_DELAY,
  MAX_RECONNECTION_ATTEMPTS,
} from '../lib/socket-events'
import { YjsSocketIOProvider } from '../lib/yjs-socketio-provider'
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

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [session, setSession] = useState<CollaborationSession | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [doc, setDoc] = useState<Y.Doc | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const docRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<YjsSocketIOProvider | null>(null)
  const isDisconnectingRef = useRef(false)
  const hasJoinedRef = useRef(false)

  const onSyncedRef = useLatest(onSynced)
  const onUserJoinedRef = useLatest(onUserJoined)
  const onUserLeftRef = useLatest(onUserLeft)
  const onSessionUpdatedRef = useLatest(onSessionUpdated)
  const onErrorRef = useLatest(onError)
  const initialContentRef = useLatest(initialContent)

  const handleSessionUpdate = useCallback(
    (sessionData: CollaborationSession) => {
      setSession(sessionData)
      onSessionUpdatedRef.current?.(sessionData)
    },
    [onSessionUpdatedRef]
  )

  const handleCollaborationEvent = useCallback(
    (event: {
      event_type: string
      user_id: string
      username: string
      note_id: string
    }) => {
      switch (event.event_type) {
        case 'user_joined':
          onUserJoinedRef.current?.({
            user_id: event.user_id,
            username: event.username,
          })
          break
        case 'user_left':
          onUserLeftRef.current?.({
            user_id: event.user_id,
            username: event.username,
          })
          break
      }
    },
    [onUserJoinedRef, onUserLeftRef]
  )

  const handleSocketError = useCallback(
    (err: Error) => {
      setError(err)
      onErrorRef.current?.(err)
    },
    [onErrorRef]
  )

  const connect = useCallback(() => {
    if (socketRef.current) {
      if (!socketRef.current.connected) {
        socketRef.current.connect()
      }
      return
    }

    setIsConnecting(true)
    setError(null)
    isDisconnectingRef.current = false

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

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)

      if (!hasJoinedRef.current) {
        // Rejoindre la session de collaboration
        socket.emit('join_collaboration', {
          note_id: noteId,
          content: initialContentRef.current ?? undefined,
        })
        hasJoinedRef.current = true
      }

      // Créer le document Yjs et le provider si pas déjà fait
      if (!docRef.current) {
        docRef.current = new Y.Doc()
        setDoc(docRef.current)
      }

      if (!providerRef.current) {
        providerRef.current = new YjsSocketIOProvider(docRef.current, {
          socket,
          noteId,
          onSynced: () => {
            setIsSynced(true)
            onSyncedRef.current?.()
          },
          onError: handleSocketError,
        })
      } else {
        providerRef.current.requestSync()
      }
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      setIsSynced(false)
      setSession(null)
      hasJoinedRef.current = false
      if (!isDisconnectingRef.current) {
        setIsConnecting(true)
      }
    })

    socket.on('connect_error', (err) => {
      setError(err)
      onErrorRef.current?.(err)
      if (!isDisconnectingRef.current) {
        setIsConnecting(true)
      }
    })

    socket.on('collaboration_session', handleSessionUpdate)
    socket.on('collaboration_event', handleCollaborationEvent)
    socket.on('error', handleSocketError)
  }, [
    noteId,
    handleSessionUpdate,
    handleCollaborationEvent,
    handleSocketError,
    onSyncedRef,
    onErrorRef,
    initialContentRef,
  ])

  const disconnect = useCallback(() => {
    isDisconnectingRef.current = true
    hasJoinedRef.current = false
    if (providerRef.current) {
      providerRef.current.destroy()
      providerRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.emit('leave_collaboration', { note_id: noteId })
      socketRef.current.close()
      socketRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setIsSynced(false)
    setSession(null)
  }, [noteId])

  const reconnect = useCallback(() => {
    disconnect()
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
    doc,
    isConnected,
    isConnecting,
    isSynced,
    session,
    error,
    reconnect,
    disconnect,
  }
}
