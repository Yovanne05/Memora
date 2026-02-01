export interface Report {
  id: string
  targetType: string
  noteId: string | null
  collectionId: string | null
  reason: string
  status: string
  description: string | null
  reporterId: string
  reporterEmail: string | null
  noteTitle: string | null
  collectionName: string | null
  createdAt: string
  updatedAt: string
}

export interface ReportCreate {
  reason: string
  description?: string | null
}

export interface ReportUpdate {
  status: string
  action?: string | null
}
