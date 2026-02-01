import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useWorkspaceContext } from '../context'

type WorkspaceMode = 'default' | 'favorites'

export function useWorkspaceNavigation(mode: WorkspaceMode = 'default') {
  const router = useRouter()
  const { actions } = useWorkspaceContext()

  const navigateToFavorites = useCallback(() => {
    router.navigate({ to: '/app/favorites' })
    actions.selectCollection(null)
    actions.selectNote(null)
  }, [router, actions])

  const navigateToNote = useCallback(
    (noteId: string, collectionId?: string) => {
      const base = mode === 'favorites' ? '/app/favorites' : '/app/workspace'

      const path = collectionId
        ? `${base}/collections/${collectionId}/notes/${noteId}`
        : `${base}/notes/${noteId}`

      router.navigate({ to: path })
      actions.selectNote(noteId)
      if (collectionId) actions.selectCollection(collectionId)
    },
    [router, actions, mode]
  )

  const navigateToCollection = useCallback(
    (collectionId: string) => {
      const base = mode === 'favorites' ? '/app/favorites' : '/app/workspace'

      router.navigate({ to: `${base}/collections/${collectionId}` })
      actions.selectCollection(collectionId)
      actions.selectNote(null)
    },
    [router, actions, mode]
  )

  const navigateToAllNotes = useCallback(() => {
    router.navigate({ to: '/app/workspace' })
    actions.selectCollection(null)
    actions.selectNote(null)
  }, [router, actions])

  return {
    navigateToFavorites,
    navigateToNote,
    navigateToCollection,
    navigateToAllNotes,
  }
}
