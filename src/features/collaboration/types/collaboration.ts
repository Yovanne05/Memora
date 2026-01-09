export type OperationType = 'insert' | 'delete' | 'replace'

export type EventType =
  | 'user_joined'
  | 'user_left'
  | 'content_changed'
  | 'cursor_moved'
  | 'user_typing'
  | 'user_stopped_typing'

export interface CollaborationOperation {
  operation_type: OperationType
  position: number
  content: string
  length?: number
  version: number
}

export interface Collaborator {
  user_id: string
  username: string
  socket_id: string
  joined_at: string
}

export interface CollaborationSession {
  note_id: string
  collaborators: Collaborator[]
  active_users_count: number
  content?: string
  version?: number
}

export interface CollaborationEvent {
  event_type: EventType
  user_id: string
  username: string
  note_id: string
  operation?: CollaborationOperation
  cursor_position?: number
  timestamp: string
}

export interface CursorPosition {
  user_id: string
  username: string
  position: number
  color?: string
}

export interface TypingStatus {
  user_id: string
  username: string
  is_typing: boolean
}
