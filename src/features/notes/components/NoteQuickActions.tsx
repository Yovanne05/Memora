import type { Note } from "../models/note.model"
import { NoteQuickActionsDialogs } from "./note-quick-actions/NoteQuickActionsDialogs"
import { NoteQuickActionsMenu } from "./note-quick-actions/NoteQuickActionsMenu"
import { useNoteQuickActions } from "../hooks/useNoteQuickActions"

interface NoteQuickActionsProps {
  readonly note: Note
  readonly onActionComplete?: () => void
  readonly triggerVariant?: "ghost" | "outline" | "default"
  readonly showLabel?: boolean
}

export function NoteQuickActions({
  note,
  onActionComplete,
  triggerVariant = "ghost",
  showLabel = false,
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
    handleToggleVisibility,
    handleMoveToCollection,
    handleDuplicate,
    handleDelete,
  } = useNoteQuickActions({ note, onActionComplete })

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
      />

      <NoteQuickActionsDialogs
        note={note}
        shareDialogOpen={shareDialogOpen}
        onShareDialogChange={setShareDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteDialogChange={setDeleteDialogOpen}
        onConfirmDelete={handleDelete}
        isDeleting={isPending}
      />
    </>
  )
}

