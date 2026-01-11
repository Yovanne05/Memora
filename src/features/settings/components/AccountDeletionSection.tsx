import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { getContextualErrorMessage } from '@/lib/error-context'
import { useDeleteUserMutation } from '@/features/users/hooks/useUserMutation'
import type { User } from '@/features/users/models/user.model'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { DeleteAccountDialog } from './account-deletion/DeleteAccountDialog'
import { DeletionInfo } from './account-deletion/DeletionInfo'

interface AccountDeletionSectionProps {
  user: User
}

export function AccountDeletionSection({ user }: AccountDeletionSectionProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const deleteMutation = useDeleteUserMutation()
  const { logout } = useAuth()

  const handleDeleteAccount = async () => {
    if (confirmText !== 'SUPPRIMER') {
      toast.error("Veuillez taper 'SUPPRIMER' pour confirmer")
      return
    }

    try {
      await deleteMutation.mutateAsync(user.id)
      toast.success('Votre compte a été supprimé')
      logout()
      window.location.href = '/auth/login'
    } catch (error) {
      const message = getContextualErrorMessage(error, {
        operation: 'delete',
        resource: 'user',
      })
      toast.error(message)
      logger.error('Deletion error', error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
          Zone de danger
        </h3>
        <p className="text-sm text-muted-foreground">
          Actions irréversibles concernant votre compte.
        </p>
      </div>

      <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 space-y-4">
        <DeletionInfo />

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>

          <DeleteAccountDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            confirmText={confirmText}
            onConfirmTextChange={setConfirmText}
            onDelete={handleDeleteAccount}
            isPending={deleteMutation.isPending}
          />
        </AlertDialog>
      </div>
    </div>
  )
}
