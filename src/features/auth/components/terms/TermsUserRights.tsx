import { Separator } from '@/components/ui/separator'

export function TermsUserRights() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-2">3. Vos droits (RGPD)</h3>
        <p className="text-muted-foreground mb-2">
          Conformément au Règlement Général sur la Protection des Données
          (RGPD), vous disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
          <li>
            <strong>Droit d'accès</strong> : vous pouvez consulter vos données
            personnelles à tout moment depuis votre profil
          </li>
          <li>
            <strong>Droit de rectification</strong> : vous pouvez modifier vos
            informations dans la section "Paramètres"
          </li>
          <li>
            <strong>Droit à l'effacement (droit à l'oubli)</strong> : vous
            pouvez supprimer votre compte et toutes vos données à tout moment
            depuis la section "Paramètres &gt; Confidentialité". La suppression
            est définitive et irréversible.
          </li>
          <li>
            <strong>Droit d'opposition</strong> : vous pouvez vous opposer au
            traitement de vos données en nous contactant à l'adresse{' '}
            <a
              href="mailto:infoiut@iut.univ-paris8.fr"
              className="text-primary hover:underline"
            >
              infoiut@iut.univ-paris8.fr
            </a>
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Vos données sont conservées tant que votre compte est actif. Après
          suppression de votre compte, toutes vos données sont définitivement
          effacées.
        </p>
      </section>
      <Separator />
    </>
  )
}
