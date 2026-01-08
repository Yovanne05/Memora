import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { NoteShareDialog } from '../NoteShareDialog'
import type { Note } from '../../models/note.model'

type NoteQuickActionsDialogsProps = {
  note: Note
  shareDialogOpen: boolean
  onShareDialogChange: (open: boolean) => void
  deleteDialogOpen: boolean
  onDeleteDialogChange: (open: boolean) => void
  onConfirmDelete: () => void
  isDeleting: boolean
  canShare: boolean
  canDelete: boolean
}

export function NoteQuickActionsDialogs({
  note,
  shareDialogOpen,
  onShareDialogChange,
  deleteDialogOpen,
  onDeleteDialogChange,
  onConfirmDelete,
  isDeleting,
  canShare,
  canDelete,
}: Readonly<NoteQuickActionsDialogsProps>) {
  return (
    <>
      {canShare && (
        <NoteShareDialog
          noteId={note.id}
          noteTitle={note.title}
          open={shareDialogOpen}
          onOpenChange={onShareDialogChange}
        />
      )}

      {canDelete && (
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={onDeleteDialogChange}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la note</AlertDialogTitle>
              <AlertDialogDescription>
                ?tes-vous s?r de vouloir supprimer "{note.title}" ? Cette action
                est irr?versible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
