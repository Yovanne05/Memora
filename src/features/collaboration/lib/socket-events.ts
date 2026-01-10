export const SOCKET_PATH = '/collaboration'
export const RECONNECTION_DELAY = 1000
export const MAX_RECONNECTION_ATTEMPTS = 5

export const SOCKET_EVENTS = {
  connect: 'connect',
  disconnect: 'disconnect',
  connectError: 'connect_error',
  session: 'collaboration_session',
  event: 'collaboration_event',
  operationAcknowledged: 'operation_acknowledged',
  error: 'error',
  join: 'join_collaboration',
  leave: 'leave_collaboration',
  sendOperation: 'send_operation',
  cursorPosition: 'cursor_position',
  typingStatus: 'typing_status',
} as const

export type SocketErrorPayload = {
  code?: number
  message: string
  type?: string
  current_version?: number
}
