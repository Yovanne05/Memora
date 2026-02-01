import { memo } from 'react'
import { AlertTriangle } from 'lucide-react'

export const DeletionInfo = memo(function DeletionInfo() {
  return (
    <>
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
    </>
  )
})
