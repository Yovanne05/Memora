import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { getContextualErrorMessage } from '@/lib/error-context'
import { notesService } from '@/features/notes/services/notes.service'
import { useUpdateReportMutation } from '@/features/report/hooks/useUpdateReportMutation'
import { Trash2 } from 'lucide-react'

type DeleteReportNoteDialogProps = {
  reportId: string
  noteId?: string | null
  noteTitle?: string | null
}

export function DeleteReportNoteDialog({
  reportId,
  noteId,
  noteTitle,
}: Readonly<DeleteReportNoteDialogProps>) {
  const [open, setOpen] = useState(false)
  const updateMutation = useUpdateReportMutation()

  const handleConfirm = async () => {
    if (!noteId) {
      toast.error('Identifiant de note introuvable')
      return
    }

    try {
      await updateMutation.mutateAsync({
        reportId,
        payload: { status: 'resolved' },
      })
      await notesService.remove(noteId)
      toast.success('Note supprimée et signalement résolu')
      setOpen(false)
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'delete',
        resource: 'note',
      })
      toast.error(message)
      console.error('Report delete note error:', error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la note signalée ?</AlertDialogTitle>
          <AlertDialogDescription>
            La note{noteTitle ? ` “${noteTitle}”` : ''} sera supprimée
            définitivement. Le signalement passera en résolu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
