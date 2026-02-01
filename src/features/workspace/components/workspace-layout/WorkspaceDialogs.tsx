import { memo } from 'react'
import { CreateNoteDialog } from '@/features/notes/components/CreateNoteDialog'
import { CreateCollectionDialog } from '@/features/collections/components/CreateCollectionDialog'
import { GraphViewDialog } from '../GraphViewDialog'
import type { NoteVisibility } from '@/features/notes/models/note.model'

interface WorkspaceDialogsProps {
  createNoteOpen: boolean
  createCollectionOpen: boolean
  onCreateNoteChange: (open: boolean) => void
  onCreateCollectionChange: (open: boolean) => void
  onCreateNote: (payload: {
    title: string
    collectionId: string | null
    visibility: NoteVisibility
    tags: string[]
  }) => void
  submitting: boolean
}

export const WorkspaceDialogs = memo(function WorkspaceDialogs({
  createNoteOpen,
  createCollectionOpen,
  onCreateNoteChange,
  onCreateCollectionChange,
  onCreateNote,
  submitting,
}: Readonly<WorkspaceDialogsProps>) {
  return (
    <>
      <CreateNoteDialog
        open={createNoteOpen}
        onOpenChange={onCreateNoteChange}
        onSubmit={onCreateNote}
        submitting={submitting}
      />

      <CreateCollectionDialog
        open={createCollectionOpen}
        onOpenChange={onCreateCollectionChange}
      />

      <GraphViewDialog />
    </>
  )
})
