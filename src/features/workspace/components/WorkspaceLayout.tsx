import type { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getContextualErrorMessage } from '@/lib/error-context'
import { WorkspaceSidebar } from './sidebar/WorkspaceSidebar'
import { WorkspaceHeader } from './WorkspaceHeader'
import { useWorkspaceContext } from '../context'
import { useWorkspaceKeyboardShortcuts } from '../hooks/useWorkspaceKeyboardShortcuts'
import { useCreateNoteMutation } from '@/features/notes/hooks/useCreateNoteMutation'
import { useUpdateNoteMutation } from '@/features/notes/hooks/useUpdateNoteMutation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { NoteVisibility } from '@/features/notes/models/note.model'
import { logger } from '@/lib/logger'
import { useDragAndDropNotes } from '@/features/notes/hooks/useDragAndDropNotes'
import { WorkspaceDragAndDrop } from './workspace-layout/WorkspaceDragAndDrop'
import { WorkspaceDialogs } from './workspace-layout/WorkspaceDialogs'

interface WorkspaceLayoutProps {
  readonly children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const { state, actions } = useWorkspaceContext()
  const router = useRouter()
  const { user } = useAuth()
  const createNoteMutation = useCreateNoteMutation()
  const updateNoteMutation = useUpdateNoteMutation()

  useWorkspaceKeyboardShortcuts()

  const handleNoteDrop = async (
    noteId: string,
    targetCollectionId: string | null
  ) => {
    try {
      await updateNoteMutation.mutateAsync({
        noteId,
        payload: { collectionId: targetCollectionId },
      })

      const collectionName = targetCollectionId
        ? 'la collection'
        : 'aucune collection'
      toast.success(`Note déplacée vers ${collectionName}`)
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'update',
        resource: 'note',
      })
      toast.error(message)
      logger.error('Error moving note:', error)
    }
  }

  const {
    activeNote,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDropNotes(handleNoteDrop)

  const handleCreateNote = async (payload: {
    title: string
    collectionId: string | null
    visibility: NoteVisibility
    tags: string[]
  }) => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour créer une note')
      return
    }

    try {
      const newNote = await createNoteMutation.mutateAsync({
        ownerId: user.id,
        title: payload.title,
        content: ' ',
        collectionId: payload.collectionId,
        visibility: payload.visibility,
        tags: payload.tags,
      })

      actions.closeCreateNote()

      const path = payload.collectionId
        ? `/app/workspace/collections/${payload.collectionId}/notes/${newNote.id}`
        : `/app/workspace/notes/${newNote.id}`

      router.navigate({ to: path })
    } catch (error) {
      logger.error('Error creating note:', error)
    }
  }

  return (
    <>
      <WorkspaceDragAndDrop
        activeNote={activeNote}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex h-[calc(100vh-4rem)] w-full">
          <WorkspaceSidebar />

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <WorkspaceHeader />
              <div className="px-2 py-2 sm:px-4 sm:py-4">{children}</div>
            </div>
          </main>
        </div>
      </WorkspaceDragAndDrop>

      <WorkspaceDialogs
        createNoteOpen={state.createNoteDialogOpen}
        createCollectionOpen={state.createCollectionDialogOpen}
        onCreateNoteChange={(open) => {
          if (!open) actions.closeCreateNote()
        }}
        onCreateCollectionChange={(open) => {
          if (!open) actions.closeCreateCollection()
        }}
        onCreateNote={handleCreateNote}
        submitting={createNoteMutation.isPending}
      />
    </>
  )
}
