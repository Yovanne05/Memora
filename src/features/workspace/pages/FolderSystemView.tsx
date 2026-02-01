import { useMemo } from 'react'
import { useWorkspaceNotes } from '../hooks/useWorkspaceNotes'
import { useWorkspaceCollections } from '../hooks/useWorkspaceCollections'
import { useWorkspaceContext } from '../context'
import { FolderSystemHeader } from './folder-system/FolderSystemHeader'
import { CollectionsSection } from './folder-system/CollectionsSection'
import { OrphanNotesSection } from './folder-system/OrphanNotesSection'
import { FolderSystemLoading } from './folder-system/FolderSystemLoading'
import { FolderSystemError } from './folder-system/FolderSystemError'
import { FolderSystemEmpty } from './folder-system/FolderSystemEmpty'

export default function FolderSystemView() {
  const {
    notes,
    total,
    limit,
    isLoading: notesLoading,
    isError: notesError,
    error: notesErrorData,
  } = useWorkspaceNotes({ orphansOnly: true })
  const {
    collections,
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useWorkspaceCollections({ mode: 'default' })
  const { state, actions } = useWorkspaceContext()

  const maxPage = useMemo(() => {
    return Math.max(0, Math.ceil(total / limit) - 1)
  }, [total, limit])

  const isLoading = notesLoading || collectionsLoading
  const isError = notesError || collectionsError

  if (isLoading) {
    return <FolderSystemLoading />
  }

  if (isError) {
    return <FolderSystemError error={notesErrorData} />
  }

  const hasCollections = collections && collections.length > 0
  const hasNotes = notes && notes.length > 0

  return (
    <div className="w-full space-y-8 p-6">
      <FolderSystemHeader
        onCreateNote={actions.openCreateNote}
        onCreateCollection={actions.openCreateCollection}
      />

      <CollectionsSection collections={collections || []} />

      <OrphanNotesSection
        notes={notes}
        total={total}
        limit={limit}
        page={state.page}
        maxPage={maxPage}
        onPageChange={actions.setPage}
      />

      {!hasCollections && !hasNotes && <FolderSystemEmpty />}
    </div>
  )
}
