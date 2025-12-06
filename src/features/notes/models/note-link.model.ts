export interface NoteLink {
  noteId: string
  linkedNoteId: string
  createdAt: string
}

export interface CreateNoteLink {
  linkedNoteId: string
}
