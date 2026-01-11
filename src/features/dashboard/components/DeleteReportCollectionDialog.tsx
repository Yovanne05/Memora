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
import { collectionsService } from '@/features/collections/services/collections.service'
import { useUpdateReportMutation } from '@/features/report/hooks/useUpdateReportMutation'
import { Trash2 } from 'lucide-react'

type DeleteReportCollectionDialogProps = {
  reportId: string
  collectionId?: string | null
  collectionName?: string | null
}

export function DeleteReportCollectionDialog({
  reportId,
  collectionId,
  collectionName,
}: Readonly<DeleteReportCollectionDialogProps>) {
  const [open, setOpen] = useState(false)
  const updateMutation = useUpdateReportMutation()

  const handleConfirm = async () => {
    if (!collectionId) {
      toast.error('Identifiant de collection introuvable')
      return
    }

    try {
      await updateMutation.mutateAsync({
        reportId,
        payload: { status: 'resolved' },
      })
      await collectionsService.remove(collectionId)
      toast.success('Collection supprimée et signalement résolu')
      setOpen(false)
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'delete',
        resource: 'collection',
      })
      toast.error(message)
      console.error('Report delete collection error:', error)
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
          <AlertDialogTitle>
            Supprimer la collection signalée ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            La collection{collectionName ? ` “${collectionName}”` : ''} sera
            supprimée définitivement. Le signalement passera en résolu.
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
