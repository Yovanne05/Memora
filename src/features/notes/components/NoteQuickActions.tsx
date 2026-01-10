import { useEffect } from 'react'
import type { Note } from '../models/note.model'
import { NoteQuickActionsDialogs } from './note-quick-actions/NoteQuickActionsDialogs'
import { NoteQuickActionsMenu } from './note-quick-actions/NoteQuickActionsMenu'
import { useNoteQuickActions } from '../hooks/useNoteQuickActions'

interface NoteQuickActionsProps {
  readonly note: Note
  readonly onActionComplete?: () => void
  readonly triggerVariant?: 'ghost' | 'outline' | 'default'
  readonly showLabel?: boolean
  readonly onInteractionChange?: (isInteracting: boolean) => void
}

export function NoteQuickActions({
  note,
  onActionComplete,
  triggerVariant = 'ghost',
  showLabel = false,
  onInteractionChange,
}: Readonly<NoteQuickActionsProps>) {
  const {
    collections,
    isPending,
    deleteDialogOpen,
    setDeleteDialogOpen,
    shareDialogOpen,
    setShareDialogOpen,
    isDropdownOpen,
    setIsDropdownOpen,
    canMove,
    canToggleVisibility,
    canShare,
    canDuplicate,
    canDelete,
    handleToggleVisibility,
    handleMoveToCollection,
    handleDuplicate,
    handleDelete,
  } = useNoteQuickActions({ note, onActionComplete })

  const hasMenuActions =
    canToggleVisibility || canShare || canMove || canDuplicate || canDelete
  const isInteracting = isDropdownOpen || shareDialogOpen || deleteDialogOpen

  useEffect(() => {
    onInteractionChange?.(isInteracting)
  }, [isInteracting, onInteractionChange])

  if (!hasMenuActions) {
    return null
  }

  return (
    <>
      <NoteQuickActionsMenu
        note={note}
        collections={collections}
        isPending={isPending}
        open={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        onToggleVisibility={handleToggleVisibility}
        onMoveToCollection={handleMoveToCollection}
        onOpenShare={() => {
          setIsDropdownOpen(false)
          setShareDialogOpen(true)
        }}
        onDuplicate={handleDuplicate}
        onOpenDelete={() => {
          setIsDropdownOpen(false)
          setDeleteDialogOpen(true)
        }}
        triggerVariant={triggerVariant}
        showLabel={showLabel}
        canMove={canMove}
        canToggleVisibility={canToggleVisibility}
        canShare={canShare}
        canDuplicate={canDuplicate}
        canDelete={canDelete}
      />

      <NoteQuickActionsDialogs
        note={note}
        shareDialogOpen={shareDialogOpen}
        onShareDialogChange={setShareDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteDialogChange={setDeleteDialogOpen}
        onConfirmDelete={handleDelete}
        isDeleting={isPending}
        canShare={canShare}
        canDelete={canDelete}
      />
    </>
  )
}
