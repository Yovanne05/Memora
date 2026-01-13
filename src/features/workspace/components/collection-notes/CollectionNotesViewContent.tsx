import { Edit, Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Note } from '@/features/notes/models/note.model'
import type { CollectionFormValues } from '@/features/collections/types/collection-form.types'
import type { Collection } from '@/features/collections/models/collection.model'
import { NavigationHeader } from '../NavigationHeader'
import { ActionBar } from '../ActionBar'
import { CollectionNotesLoading } from './CollectionNotesLoading'
import { CollectionNotesContent } from './CollectionNotesContent'
import { CollectionNotesDialogs } from './CollectionNotesDialogs'
import { ErrorHandling } from './ErrorHandling'

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
  collectionError: unknown
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
  collectionError,
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
  if (isCollectionError || isNotesError) {
    return (
      <ErrorHandling
        collectionError={collectionError}
        isCollectionError={isCollectionError}
        isNotesError={isNotesError}
        notesError={notesError}
      />
    )
  }

  if (isLoading) {
    return <CollectionNotesLoading />
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <ActionBar
        collectionId={collectionId}
        variant="collection"
        canAddNote={canAddNote}
      />
      <Button
        variant="outline"
        size="default"
        onClick={onShare}
        className="gap-2"
        disabled={!canManage}
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Partager</span>
      </Button>
      <Button
        variant="outline"
        size="default"
        onClick={onEdit}
        className="gap-2"
        disabled={!canWrite}
      >
        <Edit className="h-4 w-4" />
        <span className="hidden sm:inline">Modifier</span>
      </Button>
      <Button
        variant="destructive"
        size="default"
        onClick={onDelete}
        className="gap-2"
        disabled={!canManage}
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Supprimer</span>
      </Button>
    </div>
  )

  return (
    <div className="w-full">
      <NavigationHeader
        title={collection?.name || 'Collection'}
        description={collection?.description || undefined}
        breadcrumbs={[
          { label: 'Workspace', href: '/app/workspace' },
          { label: collection?.name || 'Collection' },
        ]}
        backHref="/app/workspace"
        actions={headerActions}
      />

      <div className="p-6 space-y-6">
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
      </div>

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
