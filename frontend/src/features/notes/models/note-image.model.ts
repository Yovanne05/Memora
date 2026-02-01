export interface NoteImage {
  url: string
}

export interface NoteImageUploadPayload {
  noteId: string
  file: File
}
