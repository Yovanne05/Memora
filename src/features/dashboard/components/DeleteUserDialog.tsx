import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
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
import { useDeleteUserMutation } from '@/features/users/hooks/useUserMutation'

type DeleteUserDialogProps = {
  userId: string
  userLabel: string
}

export function DeleteUserDialog({
  userId,
  userLabel,
}: Readonly<DeleteUserDialogProps>) {
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteUserMutation()

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(userId)
      toast.success('Compte utilisateur supprimé')
      setOpen(false)
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'delete',
        resource: 'user',
      })
      toast.error(message)
      logger.error('Delete user error', error)
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
          <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le compte {userLabel} sera supprimé définitivement. Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
