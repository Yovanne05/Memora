import { Separator } from '@/components/ui/separator'

export function TermsSecurityAndMisc() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-2">
          6. Sécurité et confidentialité
        </h3>
        <p className="text-muted-foreground">
          Nous mettons en œuvre des mesures de sécurité techniques et
          organisationnelles pour protéger vos données contre tout accès,
          modification, divulgation ou destruction non autorisés. Les mots de
          passe sont chiffrés et ne sont jamais stockés en clair. Toutefois,
          aucun système n'est totalement infaillible et nous vous encourageons à
          choisir un mot de passe fort et unique.
        </p>
      </section>

      <Separator />

      <section>
        <h3 className="font-semibold text-base mb-2">
          7. Modifications des CGU
        </h3>
        <p className="text-muted-foreground">
          Nous nous réservons le droit de modifier ces Conditions Générales
          d'Utilisation à tout moment. Vous serez informé de toute modification
          significative par e-mail ou via une notification dans l'application.
          Votre utilisation continue de Memora après ces modifications vaut
          acceptation des nouvelles conditions.
        </p>
      </section>

      <Separator />

      <section>
        <h3 className="font-semibold text-base mb-2">8. Contact</h3>
        <p className="text-muted-foreground">
          Pour toute question concernant ces Conditions Générales d'Utilisation,
          vos données personnelles, ou l'utilisation de Memora, vous pouvez nous
          contacter à :{' '}
          <a
            href="mailto:infoiut@iut.univ-paris8.fr"
            className="text-primary hover:underline"
          >
            infoiut@iut.univ-paris8.fr
          </a>
        </p>
      </section>

      <Separator />

      <section>
        <p className="text-muted-foreground italic">
          En cochant la case "J'accepte les Conditions Générales d'Utilisation"
          lors de votre inscription, vous reconnaissez avoir lu, compris et
          accepté l'ensemble de ces conditions.
        </p>
        <p className="text-muted-foreground text-xs mt-2">
          Dernière mise à jour : Janvier 2026
        </p>
      </section>
    </>
  )
}
