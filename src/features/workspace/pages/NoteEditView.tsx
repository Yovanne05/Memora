import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { NoteEditForm } from '@/features/notes/components/NoteEditForm'
import { NoteLinkManager } from '@/features/notes/components/NoteLinkManager'
import { NoteEditError } from '../components/note-edit/NoteEditError'
import { NoteEditLoading } from '../components/note-edit/NoteEditLoading'
import { NoteEditReadOnlyBanner } from '../components/note-edit/NoteEditReadOnlyBanner'
import { useNoteEditView } from '../hooks/useNoteEditView'

interface NoteEditViewProps {
  readonly noteId: string
  readonly collectionId?: string
}

export default function NoteEditView({
  noteId,
  collectionId,
}: NoteEditViewProps) {
  const {
    noteQuery,
    updateMutation,
    deleteMutation,
    note,
    isReadOnly,
    canDelete,
    handleSubmit,
    handleDelete,
  } = useNoteEditView({ noteId, collectionId })

  if (noteQuery.isLoading) {
    return <NoteEditLoading />
  }

  if (noteQuery.isError || !note) {
    return <NoteEditError />
  }

  const backUrl = note.collectionId
    ? `/app/workspace/collections/${note.collectionId}`
    : '/app/workspace'

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link to={backUrl}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </Button>
      {isReadOnly && <NoteEditReadOnlyBanner />}
      <NoteEditForm
        note={note}
        loading={updateMutation.isPending}
        deleteLoading={deleteMutation.isPending}
        onSubmit={handleSubmit}
        onDelete={canDelete ? handleDelete : undefined}
        readOnly={isReadOnly}
      />
      {note.collectionId && <NoteLinkManager note={note} />}
    </div>
  )
}
