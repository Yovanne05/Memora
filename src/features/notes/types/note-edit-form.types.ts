import type { Note, NoteVisibility } from '../models/note.model'

export interface NoteFormValues {
  title: string
  content?: string
  visibility: NoteVisibility
  collectionId?: string | null
  tags: string[]
}

export interface NoteEditFormProps {
  note?: Note
  loading?: boolean
  readOnly?: boolean
  onSubmit: (values: NoteFormValues) => void | Promise<void>
  onDelete?: () => void
  deleteLoading?: boolean
}
