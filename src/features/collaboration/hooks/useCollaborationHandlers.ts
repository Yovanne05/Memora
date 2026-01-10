import { useCallback } from 'react'
import type { RefObject } from 'react'
import type {
  CollaborationEvent,
  CollaborationOperation,
  CollaborationSession,
  CursorPosition,
  TypingStatus,
} from '../types/collaboration'
import type { SocketErrorPayload } from '../lib/socket-events'

type HandlerOptions = {
  currentVersionRef: RefObject<number>
  updateCurrentVersion: (version: number) => void
  processQueue: () => void
  setSession: (session: CollaborationSession | null) => void
  setError: (error: Error | null) => void
  onSessionUpdatedRef: RefObject<
    ((session: CollaborationSession) => void) | undefined
  >
  onOperationReceivedRef: RefObject<
    | ((operation: CollaborationOperation, event: CollaborationEvent) => void)
    | undefined
  >
  onUserJoinedRef: RefObject<((event: CollaborationEvent) => void) | undefined>
  onUserLeftRef: RefObject<((event: CollaborationEvent) => void) | undefined>
  onCursorMovedRef: RefObject<((cursor: CursorPosition) => void) | undefined>
  onTypingStatusChangedRef: RefObject<
    ((status: TypingStatus) => void) | undefined
  >
  onErrorRef: RefObject<((error: Error) => void) | undefined>
  handleVersionConflict: (errorData: SocketErrorPayload) => boolean
}

type HandlerApi = {
  handleSessionUpdate: (sessionData: CollaborationSession) => void
  handleCollaborationEvent: (event: CollaborationEvent) => void
  handleSocketError: (errorData: SocketErrorPayload) => void
}

export function useCollaborationHandlers({
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
}: HandlerOptions): HandlerApi {
  const handleSessionUpdate = useCallback(
    (sessionData: CollaborationSession) => {
      setSession(sessionData)
      if (typeof sessionData.version === 'number') {
        const prevVersion = currentVersionRef.current
        updateCurrentVersion(sessionData.version)

        if (prevVersion !== sessionData.version) {
          processQueue()
        }
      }
      onSessionUpdatedRef.current?.(sessionData)
    },
    [
      currentVersionRef,
      onSessionUpdatedRef,
      processQueue,
      setSession,
      updateCurrentVersion,
    ]
  )

  const handleCollaborationEvent = useCallback(
    (event: CollaborationEvent) => {
      switch (event.event_type) {
        case 'user_joined':
          onUserJoinedRef.current?.(event)
          break
        case 'user_left':
          onUserLeftRef.current?.(event)
          break
        case 'content_changed':
          if (event.operation) {
            updateCurrentVersion(event.operation.version)
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
    },
    [
      onCursorMovedRef,
      onOperationReceivedRef,
      onTypingStatusChangedRef,
      onUserJoinedRef,
      onUserLeftRef,
      updateCurrentVersion,
    ]
  )

  const handleSocketError = useCallback(
    (errorData: SocketErrorPayload) => {
      if (handleVersionConflict(errorData)) {
        return
      }

      const socketError = new Error(errorData.message || 'Collaboration error')
      setError(socketError)
      onErrorRef.current?.(socketError)
    },
    [handleVersionConflict, onErrorRef, setError]
  )

  return { handleSessionUpdate, handleCollaborationEvent, handleSocketError }
}
