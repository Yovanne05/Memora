import type { ReactNode } from "react"
import { useRouter } from "@tanstack/react-router"
import { toast } from "sonner"
import { WorkspaceSidebar } from "./sidebar/WorkspaceSidebar"
import { WorkspaceHeader } from "./WorkspaceHeader"
import { CreateNoteDialog } from "@/features/notes/components/CreateNoteDialog"
import { CreateCollectionDialog } from "@/features/collections/components/CreateCollectionDialog"
import { GraphViewDialog } from "./GraphViewDialog"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { useWorkspaceKeyboardShortcuts } from "../hooks/useWorkspaceKeyboardShortcuts"
import { useCreateNoteMutation } from "@/features/notes/hooks/useCreateNoteMutation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { NoteVisibility } from "@/features/notes/models/note.model"

interface WorkspaceLayoutProps {
  readonly children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const { state, actions } = useWorkspaceContext()
  const router = useRouter()
  const { user } = useAuth()
  const createNoteMutation = useCreateNoteMutation()

  useWorkspaceKeyboardShortcuts()

  const handleCreateNote = async (payload: {
    title: string
    collectionId: string | null
    visibility: NoteVisibility
    tags: string[]
  }) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour créer une note")
      return
    }

    try {
      const newNote = await createNoteMutation.mutateAsync({
        ownerId: user.id,
        title: payload.title,
        content: " ",
        collectionId: payload.collectionId,
        visibility: payload.visibility,
        tags: payload.tags,
      })

      toast.success("Note créée avec succès")
      actions.closeCreateNote()

      // Navigate to edit the new note
      const path = payload.collectionId
        ? `/app/workspace/collections/${payload.collectionId}/notes/${newNote.id}`
        : `/app/workspace/notes/${newNote.id}`

      router.navigate({ to: path })
    } catch (error) {
      toast.error("Impossible de créer la note")
      console.error("Error creating note:", error)
    }
  }

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)]">
        <WorkspaceSidebar />

        <main className="flex flex-1 flex-col overflow-hidden">
          <WorkspaceHeader />
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>

      <CreateNoteDialog
        open={state.createNoteDialogOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeCreateNote()
        }}
        onSubmit={handleCreateNote}
        submitting={createNoteMutation.isPending}
      />

      <CreateCollectionDialog
        open={state.createCollectionDialogOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeCreateCollection()
        }}
      />

      <GraphViewDialog />
    </>
  )
}
