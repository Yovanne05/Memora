import type { Note } from '@/features/notes/models/note.model'
export type CollectionVisibility = 'private' | 'public'
export type CollectionPermission = 'read' | 'write' | 'owner'

export interface GraphNode {
  id: string
  data: {
    label: string
    note_id: string
    title: string
    tags: string[]
  }
}

export type GraphEdge = {
  id: string
  source: string
  target: string
  label?: string
}


export interface Collection {
  id: string
  ownerId: string
  name: string
  description?: string | null
  visibility: CollectionVisibility
  tags: string[]
  notes: Note[]
  isFavorite?: boolean
  notesCount?: number
  userPermission?: CollectionPermission | null
  nodes: GraphNode[]
  edges: GraphEdge[]
  createdAt: string
  updatedAt: string
}

export interface CollectionCreate {
  ownerId: string
  name: string
  description?: string | null
  visibility?: CollectionVisibility
  tags?: string[]
}

export interface CollectionUpdate {
  name?: string
  description?: string | null
  visibility?: CollectionVisibility
  tags?: string[]
}
