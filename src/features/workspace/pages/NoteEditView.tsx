import { NoteEditForm } from "@/features/notes/components/NoteEditForm"
import { NoteLinkManager } from "@/features/notes/components/NoteLinkManager"
import { NoteEditError } from "./note-edit-view/NoteEditError"
import { NoteEditLoading } from "./note-edit-view/NoteEditLoading"
import { NoteEditReadOnlyBanner } from "./note-edit-view/NoteEditReadOnlyBanner"
import { useNoteEditView } from "../hooks/useNoteEditView"

interface NoteEditViewProps {
  readonly noteId: string
  readonly collectionId?: string
}

export default function NoteEditView({ noteId, collectionId }: NoteEditViewProps) {
  const {
    noteQuery,
    updateMutation,
    deleteMutation,
    note,
    isReadOnly,
    canDelete,
    handleSubmit,
    handleDelete,
    handleCancel,
  } = useNoteEditView({ noteId, collectionId })

  if (noteQuery.isLoading) {
    return <NoteEditLoading />
  }

  if (noteQuery.isError || !note) {
    return <NoteEditError />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isReadOnly && <NoteEditReadOnlyBanner />}
      <NoteEditForm
        note={note}
        loading={updateMutation.isPending}
        deleteLoading={deleteMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDelete={canDelete ? handleDelete : undefined}
        readOnly={isReadOnly}
      />
      {note.collectionId && <NoteLinkManager note={note} />}
    </div>
  )
}



