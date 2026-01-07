import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NoteShareDialog } from "../NoteShareDialog"
import type { Note } from "../../models/note.model"

type NoteQuickActionsDialogsProps = {
  note: Note
  shareDialogOpen: boolean
  onShareDialogChange: (open: boolean) => void
  deleteDialogOpen: boolean
  onDeleteDialogChange: (open: boolean) => void
  onConfirmDelete: () => void
  isDeleting: boolean
}

export function NoteQuickActionsDialogs({
  note,
  shareDialogOpen,
  onShareDialogChange,
  deleteDialogOpen,
  onDeleteDialogChange,
  onConfirmDelete,
  isDeleting,
}: Readonly<NoteQuickActionsDialogsProps>) {
  return (
    <>
      <NoteShareDialog
        noteId={note.id}
        noteTitle={note.title}
        open={shareDialogOpen}
        onOpenChange={onShareDialogChange}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la note</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{note.title}" ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
