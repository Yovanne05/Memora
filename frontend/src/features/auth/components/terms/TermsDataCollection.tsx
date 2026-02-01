import { Separator } from '@/components/ui/separator'

export function TermsDataCollection() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-2">
          2. Inscription et données collectées
        </h3>
        <p className="text-muted-foreground mb-2">
          Lors de votre inscription, nous collectons les données suivantes :
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
          <li>
            <strong>Adresse e-mail</strong> : utilisée pour l'authentification
            et la récupération de votre mot de passe en cas d'oubli
          </li>
          <li>
            <strong>Mot de passe</strong> : stocké de manière sécurisée
            (chiffré) pour vous identifier et protéger votre compte
          </li>
          <li>
            <strong>Nom d'utilisateur</strong> : unique, utilisé comme nom
            d'affichage dans l'application lors du partage de notes ou
            collections
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Ces données sont nécessaires au bon fonctionnement de l'application
          et ne seront jamais partagées avec des tiers.
        </p>
      </section>
      <Separator />
    </>
  )
}
