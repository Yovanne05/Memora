import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { FileText } from "lucide-react"
import { useNoteQuery } from "@/features/notes/hooks/useNoteQuery"
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import { useDeleteNoteMutation } from "@/features/notes/hooks/useDeleteNoteMutation"
import { NoteDetailsSkeleton } from "../components/details/NoteDetailsSkeleton"
import { NoteDetailsError } from "../components/details/NoteDetailsError"
import { NoteEditForm, type NoteFormValues } from "../components/forms/NoteEditForm"
import { DeleteNoteDialog } from "../components/dialogs/DeleteNoteDialog"

interface NoteEditPageProps {
  noteId: string
}

export function NoteEditPage({ noteId }: Readonly<NoteEditPageProps>) {
  const router = useRouter()
  const { data: note, isLoading, isError, error } = useNoteQuery(noteId)
  const updateNoteMutation = useUpdateNoteMutation()
  const deleteNoteMutation = useDeleteNoteMutation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleSave = async (values: NoteFormValues) => {
    await updateNoteMutation.mutateAsync({
      noteId,
      payload: {
        title: values.title,
        content: values.content,
        visibility: values.visibility,
        collectionId: values.collectionId,
        tags: values.tags,
      },
    })
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
    return <NoteDetailsError message={error?.message} />
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <Link to="/app/notes" className="hover:text-foreground">
            Notes
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/app/notes/$id" params={{ id: noteId }} className="hover:text-foreground">
            {note.title}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Modifier</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">{note.title}</h1>
          <p className="text-sm text-muted-foreground">Adapte le contenu, les tags, la collection et la visibilité.</p>
        </div>
      </div>

      <NoteEditForm
        note={note}
        loading={updateNoteMutation.isPending}
        onSubmit={handleSave}
        onDelete={() => setIsDeleteDialogOpen(true)}
        deleteLoading={deleteNoteMutation.isPending}
        onCancel={() => router.navigate({ to: "/app/notes/$id", params: { id: noteId } })}
      />

      <DeleteNoteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        loading={deleteNoteMutation.isPending}
      />
    </div>
  )
}
