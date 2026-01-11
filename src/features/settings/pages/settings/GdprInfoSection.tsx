import { memo } from 'react'
import { Info } from 'lucide-react'

export const GdprInfoSection = memo(function GdprInfoSection() {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium">Vos droits selon le RGPD</p>
          <p className="text-sm text-muted-foreground">
            Conformément au Règlement Général sur la Protection des Données
            (RGPD) et à la loi française, vous disposez de plusieurs droits
            concernant vos données personnelles :
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
            <li>
              <strong>Droit d'accès</strong> : Accédez à vos données via votre
              profil
            </li>
            <li>
              <strong>Droit de rectification</strong> : Modifiez vos
              informations dans les sections ci-dessus
            </li>
            <li>
              <strong>Droit à l'effacement</strong> : Supprimez votre compte et
              toutes vos données
            </li>
            <li>
              <strong>Droit d'opposition</strong> : Contactez-nous via
              infoiut@iut.univ-paris8.fr pour vous opposer au traitement de vos
              données
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
})
