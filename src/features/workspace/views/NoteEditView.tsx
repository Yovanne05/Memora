import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { NoteEditForm, type NoteFormValues } from "@/features/notes/components/forms/NoteEditForm"
import { useNoteQuery } from "@/features/notes/hooks/useNoteQuery"
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import { useDeleteNoteMutation } from "@/features/notes/hooks/useDeleteNoteMutation"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { useWorkspaceNavigation } from "../hooks/useWorkspaceNavigation"
import { useToast } from "@/hooks/use-toast"

interface NoteEditViewProps {
  readonly noteId: string
  readonly collectionId?: string
}

export default function NoteEditView({ noteId, collectionId }: NoteEditViewProps) {
  const router = useRouter()
  const { toast } = useToast()
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

      toast({
        title: "Note mise à jour",
        description: "Vos modifications ont été enregistrées",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la note",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(noteId)

      toast({
        title: "Note supprimée",
        description: "La note a été supprimée avec succès",
      })

      // Navigate back to collection or all notes
      if (collectionId) {
        navigateToCollection(collectionId)
      } else {
        navigateToAllNotes()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      })
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
    <div className="mx-auto max-w-6xl">
      <NoteEditForm
        note={noteQuery.data}
        loading={updateMutation.isPending}
        deleteLoading={deleteMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </div>
  )
}
