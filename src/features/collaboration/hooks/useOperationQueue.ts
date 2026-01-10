import { useCallback, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Socket } from 'socket.io-client'
import type { CollaborationOperation } from '../types/collaboration'
import { SOCKET_EVENTS, type SocketErrorPayload } from '../lib/socket-events'

type OperationQueueOptions = {
  noteId: string
  socketRef: MutableRefObject<Socket | null>
  currentVersionRef: MutableRefObject<number>
  updateCurrentVersion: (version: number) => void
  isFullDocumentReplace: (
    operation: CollaborationOperation | Omit<CollaborationOperation, 'version'>
  ) => boolean
}

type OperationQueueApi = {
  enqueueOperation: (operation: Omit<CollaborationOperation, 'version'>) => void
  processQueue: () => void
  handleOperationAcknowledged: (data: { version: number }) => void
  handleVersionConflict: (errorData: SocketErrorPayload) => boolean
  resetQueue: () => void
}

export function useOperationQueue({
  noteId,
  socketRef,
  currentVersionRef,
  updateCurrentVersion,
  isFullDocumentReplace,
}: OperationQueueOptions): OperationQueueApi {
  const operationQueueRef = useRef<
    Array<Omit<CollaborationOperation, 'version'>>
  >([])
  const isProcessingQueueRef = useRef(false)
  const pendingOperationRef = useRef<CollaborationOperation | null>(null)

  const resetQueue = useCallback(() => {
    operationQueueRef.current = []
    pendingOperationRef.current = null
    isProcessingQueueRef.current = false
  }, [])

  const processQueue = useCallback(() => {
    const socket = socketRef.current
    if (isProcessingQueueRef.current || !socket?.connected) {
      return
    }

    const nextOperation = operationQueueRef.current.shift()
    if (!nextOperation) {
      isProcessingQueueRef.current = false
      return
    }

    isProcessingQueueRef.current = true

    const nextVersion = currentVersionRef.current + 1
    const fullOperation: CollaborationOperation = {
      ...nextOperation,
      version: nextVersion,
    }

    pendingOperationRef.current = fullOperation

    socket.emit(SOCKET_EVENTS.sendOperation, {
      note_id: noteId,
      operation: fullOperation,
    })
  }, [currentVersionRef, noteId, socketRef])

  const enqueueOperation = useCallback(
    (operation: Omit<CollaborationOperation, 'version'>) => {
      if (!socketRef.current?.connected) {
        return
      }

      if (isFullDocumentReplace(operation)) {
        const hasNonReplace = operationQueueRef.current.some(
          (queuedOperation) => !isFullDocumentReplace(queuedOperation)
        )
        if (hasNonReplace) {
          operationQueueRef.current.push(operation)
        } else {
          operationQueueRef.current = [operation]
        }
      } else {
        operationQueueRef.current.push(operation)
      }

      processQueue()
    },
    [isFullDocumentReplace, processQueue, socketRef]
  )

  const handleOperationAcknowledged = useCallback(
    (data: { version: number }) => {
      updateCurrentVersion(data.version)
      pendingOperationRef.current = null
      isProcessingQueueRef.current = false
      processQueue()
    },
    [processQueue, updateCurrentVersion]
  )

  const handleVersionConflict = useCallback(
    (errorData: SocketErrorPayload) => {
      if (
        errorData.type !== 'version_conflict' ||
        !pendingOperationRef.current
      ) {
        return false
      }

      if (typeof errorData.current_version === 'number') {
        updateCurrentVersion(errorData.current_version)
      }

      const pendingOperation = pendingOperationRef.current
      const shouldDropPending =
        isFullDocumentReplace(pendingOperation) &&
        operationQueueRef.current.length > 0

      if (!shouldDropPending) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { version, ...operationWithoutVersion } = pendingOperation
        operationQueueRef.current.unshift(operationWithoutVersion)
      }

      pendingOperationRef.current = null
      isProcessingQueueRef.current = false

      setTimeout(() => {
        processQueue()
      }, 10)

      return true
    },
    [isFullDocumentReplace, processQueue, updateCurrentVersion]
  )

  return {
    enqueueOperation,
    processQueue,
    handleOperationAcknowledged,
    handleVersionConflict,
    resetQueue,
  }
}
