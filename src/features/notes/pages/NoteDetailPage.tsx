import { useMemo, useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { useNoteQuery } from "../hooks/useNoteQuery"
import { useDeleteNoteMutation } from "../hooks/useDeleteNoteMutation"
import { NoteDetailsSkeleton } from "../components/details/NoteDetailsSkeleton"
import { NoteDetailsError } from "../components/details/NoteDetailsError"
import { NoteDetailsHeader } from "../components/details/NoteDetailsHeader"
import { NoteDetailsContent } from "../components/details/NoteDetailsContent"
import { DeleteNoteDialog } from "../components/dialogs/DeleteNoteDialog"

export function NoteDetailPage({ noteId }: { noteId: string }) {
  const router = useRouter()
  const { data: note, isLoading, isError, error, refetch } = useNoteQuery(noteId)
  const deleteNoteMutation = useDeleteNoteMutation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const paragraphs = useMemo(
    () =>
      (note?.content ?? "")
        .split(/\n+/)
        .map((block) => block.trim())
        .filter(Boolean),
    [note?.content]
  )

  const handleEdit = () => {
    router.navigate({ to: "/app/notes/$id/edit", params: { id: noteId } })
  }

  const handleDelete = async () => {
    await deleteNoteMutation.mutateAsync(noteId)
    setIsDeleteDialogOpen(false)
    router.navigate({ to: "/app/notes" })
  }

  if (isLoading) {
    return <NoteDetailsSkeleton />
  }

  if (isError || !note) {
    return (
      <NoteDetailsError
        message={error?.message ?? "Impossible de charger la note."}
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6 p-6">
      <NoteDetailsHeader
        note={note}
        onEdit={handleEdit}
        onDelete={() => setIsDeleteDialogOpen(true)}
        isDeleting={deleteNoteMutation.isPending}
      />

      <NoteDetailsContent note={note} paragraphs={paragraphs} />

      <DeleteNoteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        loading={deleteNoteMutation.isPending}
      />
    </div>
  )
}

