import type {
  CollaborationEvent,
  CollaborationOperation,
  CollaborationSession,
  CursorPosition,
  TypingStatus,
} from '../types/collaboration'

export interface UseCollaborationOptions {
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

export interface UseCollaborationReturn {
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
