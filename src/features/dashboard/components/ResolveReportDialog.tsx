import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
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
import { useUpdateReportMutation } from '@/features/report/hooks/useUpdateReportMutation'

type ResolveReportDialogProps = {
  reportId: string
}

export function ResolveReportDialog({
  reportId,
}: Readonly<ResolveReportDialogProps>) {
  const [open, setOpen] = useState(false)
  const updateMutation = useUpdateReportMutation()

  const handleConfirm = async () => {
    try {
      await updateMutation.mutateAsync({
        reportId,
        payload: { status: 'resolved' },
      })
      toast.success('Signalement résolu')
      setOpen(false)
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'update',
        resource: 'report',
      })
      toast.error(message)
      console.error('Resolve report error:', error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Résoudre
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Marquer ce signalement comme résolu ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action clôture le signalement sans supprimer la note ou la
            collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Résolution...' : 'Résoudre'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
