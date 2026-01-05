import { useCallback } from "react"
import { useRouter } from "@tanstack/react-router"
import { useWorkspaceContext } from "../context/WorkspaceContext"

export function useWorkspaceNavigation() {
  const router = useRouter()
  const { actions } = useWorkspaceContext()

  const navigateToNote = useCallback(
    (noteId: string, collectionId?: string) => {
      const path = collectionId
        ? `/app/workspace/collections/${collectionId}/notes/${noteId}`
        : `/app/workspace/notes/${noteId}`

      router.navigate({ to: path })
      actions.selectNote(noteId)
      if (collectionId) {
        actions.selectCollection(collectionId)
      }
    },
    [router, actions]
  )

  const navigateToCollection = useCallback(
    (collectionId: string) => {
      router.navigate({ to: `/app/workspace/collections/${collectionId}` })
      actions.selectCollection(collectionId)
      actions.selectNote(null)
    },
    [router, actions]
  )

  const navigateToAllNotes = useCallback(() => {
    router.navigate({ to: "/app/workspace" })
    actions.selectCollection(null)
    actions.selectNote(null)
  }, [router, actions])

  return {
    navigateToNote,
    navigateToCollection,
    navigateToAllNotes,
  }
}
