import { useMemo } from 'react'

import { useCollectionQuery } from '@/features/collections/hooks/useCollectionQuery'
import { useNoteQuery } from '@/features/notes/hooks/useNoteQuery'

type BreadcrumbItem = {
  label: string
  href?: string
}

type UseWorkspaceBreadcrumbsArgs = {
  selectedCollectionId: string | null
  selectedNoteId: string | null
  mode?: 'default' | 'favorites'
}

export function useWorkspaceBreadcrumbs({
  selectedCollectionId,
  selectedNoteId,
  mode = 'default',
}: UseWorkspaceBreadcrumbsArgs) {
  const collectionQuery = useCollectionQuery(selectedCollectionId || '')
  const noteQuery = useNoteQuery(selectedNoteId || '')

  return useMemo<BreadcrumbItem[]>(() => {
    const base =
      mode === 'favorites' ? '/app/workspace/favorites' : '/app/workspace'
    const items: BreadcrumbItem[] = []

    if (mode === 'favorites') {
      items.push({ label: 'Mes favoris', href: base })
    }

    if (selectedCollectionId && collectionQuery.data) {
      items.push({
        label: collectionQuery.data.name,
        href: `${base}/collections/${selectedCollectionId}`,
      })
    }

    if (selectedNoteId && noteQuery.data) {
      items.push({
        label: noteQuery.data.title || 'Sans titre',
      })
    }

    return items
  }, [
    selectedCollectionId,
    selectedNoteId,
    collectionQuery.data,
    noteQuery.data,
    mode,
  ])
}
