import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { NoteEditForm, type NoteFormValues } from "@/features/notes/components/forms/NoteEditForm"
import { NoteLinkManager } from "@/features/notes/components/NoteLinkManager"
import { useNoteQuery } from "@/features/notes/hooks/useNoteQuery"
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import { useDeleteNoteMutation } from "@/features/notes/hooks/useDeleteNoteMutation"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { useWorkspaceNavigation } from "../hooks/useWorkspaceNavigation"

interface NoteEditViewProps {
  readonly noteId: string
  readonly collectionId?: string
}

export default function NoteEditView({ noteId, collectionId }: NoteEditViewProps) {
  const router = useRouter()
  const { actions } = useWorkspaceContext()
  const { navigateToCollection, navigateToAllNotes } = useWorkspaceNavigation()

  const noteQuery = useNoteQuery(noteId)
  const updateMutation = useUpdateNoteMutation()
  const deleteMutation = useDeleteNoteMutation()

  // Update selected note in context
  useEffect(() => {
    actions.selectNote(noteId)
    if (collectionId) {
      actions.selectCollection(collectionId)
    }
  }, [noteId, collectionId, actions])

  const handleSubmit = async (values: NoteFormValues) => {
    try {
      await updateMutation.mutateAsync({
        noteId: noteId,
        payload: {
          title: values.title,
          content: values.content,
          visibility: values.visibility,
          collectionId: values.collectionId,
          tags: values.tags,
        },
      })
      // Toast de succès géré automatiquement par useUpdateNoteMutation
    } catch (error) {
      // Toast d'erreur géré automatiquement par useUpdateNoteMutation
      console.error("Failed to update note:", error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(noteId)

      // Navigate back to collection or all notes
      if (collectionId) {
        navigateToCollection(collectionId)
      } else {
        navigateToAllNotes()
      }
      // Toast de succès géré automatiquement par useDeleteNoteMutation
    } catch (error) {
      // Toast d'erreur géré automatiquement par useDeleteNoteMutation
      console.error("Failed to delete note:", error)
    }
  }

  const handleCancel = () => {
    router.history.back()
  }

  if (noteQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (noteQuery.isError || !noteQuery.data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-destructive">Note introuvable</p>
        <p className="text-sm text-muted-foreground">
          Cette note n'existe pas ou vous n'avez pas accès à celle-ci
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <NoteEditForm
        note={noteQuery.data}
        loading={updateMutation.isPending}
        deleteLoading={deleteMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />

      {/* Section de liaison de notes - visible uniquement si la note est dans une collection */}
      {noteQuery.data.collectionId && (
        <NoteLinkManager note={noteQuery.data} />
      )}
    </div>
  )
}
