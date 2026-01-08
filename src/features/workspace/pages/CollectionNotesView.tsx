import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { CollectionNotesViewContent } from '../components/collection-notes/CollectionNotesViewContent'
import { useDeleteCollectionMutation } from '@/features/collections/hooks/useDeleteCollectionMutation'
import { useCollectionNotesView } from '../hooks/useCollectionNotesView'
import { useCollectionPermissions } from '../hooks/useCollectionPermissions'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface CollectionNotesViewProps {
  readonly collectionId: string
}

export default function CollectionNotesView({
  collectionId,
}: CollectionNotesViewProps) {
  const router = useRouter()
  const {
    collectionQuery,
    notes,
    total,
    limit,
    isLoading,
    isError,
    error,
    state,
    actions,
    editDialogOpen,
    setEditDialogOpen,
    updateCollectionMutation,
    maxPage,
    handleUpdateCollection,
  } = useCollectionNotesView(collectionId)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteCollectionMutation = useDeleteCollectionMutation()
  const { user } = useAuth()

  const collection = collectionQuery.data ?? null
  const { canManage, canWrite, canAddNote } = useCollectionPermissions(
    collection,
    user
  )

  const handleDeleteConfirm = async () => {
    await deleteCollectionMutation.mutateAsync(collectionId)
    router.navigate({ to: '/app/workspace' })
  }

  return (
    <CollectionNotesViewContent
      collection={collection}
      collectionId={collectionId}
      notes={notes}
      total={total}
      limit={limit}
      page={state.page}
      maxPage={maxPage}
      canManage={canManage}
      canWrite={canWrite}
      canAddNote={canAddNote}
      editDialogOpen={editDialogOpen}
      shareDialogOpen={shareDialogOpen}
      deleteDialogOpen={deleteDialogOpen}
      updatePending={updateCollectionMutation.isPending}
      deletePending={deleteCollectionMutation.isPending}
      isLoading={collectionQuery.isLoading || isLoading}
      isCollectionError={collectionQuery.isError}
      isNotesError={isError}
      notesError={error}
      onEdit={() => setEditDialogOpen(true)}
      onShare={() => setShareDialogOpen(true)}
      onDelete={() => setDeleteDialogOpen(true)}
      onPageChange={actions.setPage}
      onEditClose={() => setEditDialogOpen(false)}
      onEditSubmit={handleUpdateCollection}
      onShareOpenChange={setShareDialogOpen}
      onDeleteOpenChange={setDeleteDialogOpen}
      onDeleteConfirm={handleDeleteConfirm}
    />
  )
}
