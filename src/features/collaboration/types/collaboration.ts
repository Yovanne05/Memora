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
}
