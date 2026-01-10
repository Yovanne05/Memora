import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteUserMutation } from '@/features/users/hooks/useUserMutation'
import type { User } from '@/features/users/models/user.model'
import { useAuth } from '@/features/auth/hooks/useAuth'

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
      await logout()
      window.location.href = '/auth/login'
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte')
      console.error('Deletion error:', error)
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
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium">Supprimer mon compte</p>
            <p className="text-sm text-muted-foreground">
              Une fois votre compte supprimé, toutes vos données seront
              définitivement effacées. Cette action est irréversible.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Données qui seront supprimées :</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Votre profil et informations personnelles</li>
            <li>Toutes vos notes et leur contenu</li>
            <li>Toutes vos collections</li>
            <li>Toutes vos flashcards et historique de révision</li>
            <li>Vos statistiques d'utilisation</li>
            <li>Vos partages et collaborations</li>
          </ul>
        </div>

        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            <strong>Conseil :</strong> Avant de supprimer votre compte, pensez à
            exporter vos données dans la section ci-dessus si vous souhaitez en
            conserver une copie.
          </p>
        </div>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Êtes-vous absolument sûr ?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Cette action est irréversible. Toutes vos données seront
                  définitivement supprimées de nos serveurs.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    Tapez <strong>SUPPRIMER</strong> pour confirmer :
                  </Label>
                  <Input
                    id="confirm-delete"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="SUPPRIMER"
                    className="font-mono"
                  />
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    <strong>Droit à l'oubli (RGPD) :</strong> Conformément à
                    l'article 17 du RGPD, vous exercez ici votre droit à
                    l'effacement de vos données personnelles.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText('')}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={
                  confirmText !== 'SUPPRIMER' || deleteMutation.isPending
                }
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending
                  ? 'Suppression...'
                  : 'Supprimer définitivement'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
