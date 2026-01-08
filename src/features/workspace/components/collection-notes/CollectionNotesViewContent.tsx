import type { Note } from '@/features/notes/models/note.model'
import type { CollectionFormValues } from '@/features/collections/types/collection-form.types'
import type { Collection } from '@/features/collections/models/collection.model'
import { CollectionNotesError } from './CollectionNotesError'
import { CollectionNotesLoading } from './CollectionNotesLoading'
import { CollectionNotesHeader } from './CollectionNotesHeader'
import { CollectionNotesContent } from './CollectionNotesContent'
import { CollectionNotesDialogs } from './CollectionNotesDialogs'

type CollectionNotesViewContentProps = {
  collection: Collection | null
  collectionId: string
  notes: Note[] | null
  total: number
  limit: number
  page: number
  maxPage: number
  canManage: boolean
  canWrite: boolean
  canAddNote: boolean
  editDialogOpen: boolean
  shareDialogOpen: boolean
  deleteDialogOpen: boolean
  updatePending: boolean
  deletePending: boolean
  isLoading: boolean
  isCollectionError: boolean
  isNotesError: boolean
  notesError: Error | null
  onEdit: () => void
  onShare: () => void
  onDelete: () => void
  onPageChange: (page: number) => void
  onEditClose: () => void
  onEditSubmit: (values: CollectionFormValues) => Promise<void>
  onShareOpenChange: (open: boolean) => void
  onDeleteOpenChange: (open: boolean) => void
  onDeleteConfirm: () => void
}

export function CollectionNotesViewContent({
  collection,
  collectionId,
  notes,
  total,
  limit,
  page,
  maxPage,
  canManage,
  canWrite,
  canAddNote,
  editDialogOpen,
  shareDialogOpen,
  deleteDialogOpen,
  updatePending,
  deletePending,
  isLoading,
  isCollectionError,
  isNotesError,
  notesError,
  onEdit,
  onShare,
  onDelete,
  onPageChange,
  onEditClose,
  onEditSubmit,
  onShareOpenChange,
  onDeleteOpenChange,
  onDeleteConfirm,
}: Readonly<CollectionNotesViewContentProps>) {
  if (isLoading) {
    return <CollectionNotesLoading />
  }

  if (isCollectionError) {
    return <CollectionNotesError title="Collection introuvable" />
  }

  if (isNotesError) {
    return (
      <CollectionNotesError
        title="Erreur lors du chargement des notes"
        message={
          notesError instanceof Error
            ? notesError.message
            : 'Une erreur est survenue'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <CollectionNotesHeader
        collection={collection}
        collectionId={collectionId}
        onEdit={onEdit}
        onShare={onShare}
        onDelete={onDelete}
        canAddNote={canAddNote}
        canEdit={canWrite}
        canShare={canManage}
        canDelete={canManage}
      />

      <CollectionNotesContent
        notes={notes}
        collectionId={collectionId}
        page={page}
        maxPage={maxPage}
        total={total}
        limit={limit}
        canAddNote={canAddNote}
        onPageChange={onPageChange}
      />

      <CollectionNotesDialogs
        collection={collection}
        canManage={canManage}
        editDialogOpen={editDialogOpen}
        shareDialogOpen={shareDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        updatePending={updatePending}
        deletePending={deletePending}
        onEditClose={onEditClose}
        onEditSubmit={onEditSubmit}
        onShareOpenChange={onShareOpenChange}
        onDeleteOpenChange={onDeleteOpenChange}
        onDeleteConfirm={onDeleteConfirm}
      />
    </div>
  )
}
