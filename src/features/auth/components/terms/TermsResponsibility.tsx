import { Separator } from '@/components/ui/separator'

export function TermsResponsibility() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-2">
          4. Responsabilité et contenu
        </h3>
        <p className="text-muted-foreground mb-2">
          En utilisant Memora, vous vous engagez à :
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
          <li>
            Être <strong>responsable du contenu</strong> que vous créez (notes,
            flashcards, collections)
          </li>
          <li>
            Ne pas publier de contenu{' '}
            <strong>
              illégal, diffamatoire, discriminatoire, haineux ou contraire aux
              bonnes mœurs
            </strong>
          </li>
          <li>
            Respecter les{' '}
            <strong>droits d'auteur et la propriété intellectuelle</strong>{' '}
            d'autrui
          </li>
          <li>
            Respecter les <strong>autres utilisateurs</strong> dans le cadre du
            partage et de la collaboration
          </li>
          <li>
            Ne pas utiliser l'application pour{' '}
            <strong>harceler, menacer ou nuire</strong> à d'autres utilisateurs
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Vous êtes seul responsable de l'utilisation que vous faites de vos
          notes et du contenu que vous partagez.
        </p>
      </section>
      <Separator />
    </>
  )
}
