import { Separator } from '@/components/ui/separator'

export function TermsReporting() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-2">
          5. Signalement de contenu inapproprié
        </h3>
        <p className="text-muted-foreground mb-2">
          Si vous constatez qu'une note ou une collection partagée contient du
          contenu inapproprié, vous pouvez :
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
          <li>Signaler une note ou une collection via le boutton dédié</li>
          <li>
            Contacter un administrateur en envoyant un e-mail à{' '}
            <a
              href="mailto:infoiut@iut.univ-paris8.fr"
              className="text-primary hover:underline"
            >
              infoiut@iut.univ-paris8.fr
            </a>{' '}
            en précisant l'URL ou l'identifiant du contenu concerné
          </li>
          <li>
            Décrire précisément le problème et fournir des captures d'écran si
            nécessaire
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Les administrateurs examineront votre signalement et prendront les
          mesures appropriées si nécessaire (avertissement, suppression du
          contenu, suspension du compte).
        </p>
      </section>
      <Separator />
    </>
  )
}
