import { memo } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface DeleteAccountDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  confirmText: string
  onConfirmTextChange: (text: string) => void
  onDelete: () => void
  isPending: boolean
}

export const DeleteAccountDialog = memo(function DeleteAccountDialog({
  isOpen,
  onOpenChange,
  confirmText,
  onConfirmTextChange,
  onDelete,
  isPending,
}: Readonly<DeleteAccountDialogProps>) {
  const handleCancel = () => {
    onConfirmTextChange('')
    onOpenChange(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
                onChange={(e) => onConfirmTextChange(e.target.value)}
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
          <AlertDialogCancel onClick={handleCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={confirmText !== 'SUPPRIMER' || isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Suppression...' : 'Supprimer définitivement'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
