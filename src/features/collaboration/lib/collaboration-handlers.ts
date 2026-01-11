import type { CollaborationSession } from '../types/collaboration'

export type CollaborationEvent = {
  event_type: string
  user_id: string
  username: string
  note_id: string
}

export type UserEventCallbacks = {
  onUserJoined?: (event: { user_id: string; username: string }) => void
  onUserLeft?: (event: { user_id: string; username: string }) => void
}

export function handleCollaborationEvent(
  event: CollaborationEvent,
  callbacks: UserEventCallbacks
): void {
  const { event_type, user_id, username } = event

  switch (event_type) {
    case 'user_joined':
      callbacks.onUserJoined?.({ user_id, username })
      break
    case 'user_left':
      callbacks.onUserLeft?.({ user_id, username })
      break
  }
}

export function handleSessionUpdate(
  sessionData: CollaborationSession,
  callbacks: {
    onSessionUpdated?: (session: CollaborationSession) => void
    onSessionChange: (session: CollaborationSession) => void
  }
): void {
  callbacks.onSessionChange(sessionData)
  callbacks.onSessionUpdated?.(sessionData)
}
