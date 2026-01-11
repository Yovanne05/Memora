import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface TermsOfServiceDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TermsOfServiceDialog({
  trigger,
  open,
  onOpenChange,
}: TermsOfServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conditions Générales d'Utilisation</DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement ces conditions avant d'utiliser Memora
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introduction */}
            <section>
              <h3 className="font-semibold text-base mb-2">
                1. Présentation de l'application
              </h3>
              <p className="text-muted-foreground">
                Memora est une application de gestion de notes et de
                connaissances développée dans le cadre d'un projet académique.
                Elle permet de créer, organiser et partager des notes, de les
                relier entre elles via un graphe de connaissances, et de réviser
                vos contenus grâce à un système de répétition espacée.
              </p>
            </section>

            <Separator />

            {/* Inscription et données */}
            <section>
              <h3 className="font-semibold text-base mb-2">
                2. Inscription et données collectées
              </h3>
              <p className="text-muted-foreground mb-2">
                Lors de votre inscription, nous collectons les données suivantes
                :
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  <strong>Adresse e-mail</strong> : utilisée pour
                  l'authentification et la récupération de votre mot de passe en
                  cas d'oubli
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
                Ces données sont nécessaires au bon fonctionnement de
                l'application et ne seront jamais partagées avec des tiers.
              </p>
            </section>

            <Separator />

            {/* RGPD et droits */}
            <section>
              <h3 className="font-semibold text-base mb-2">
                3. Vos droits (RGPD)
              </h3>
              <p className="text-muted-foreground mb-2">
                Conformément au Règlement Général sur la Protection des Données
                (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  <strong>Droit d'accès</strong> : vous pouvez consulter vos
                  données personnelles à tout moment depuis votre profil
                </li>
                <li>
                  <strong>Droit de rectification</strong> : vous pouvez modifier
                  vos informations dans la section "Paramètres"
                </li>
                <li>
                  <strong>Droit à l'effacement (droit à l'oubli)</strong> : vous
                  pouvez supprimer votre compte et toutes vos données à tout
                  moment depuis la section "Paramètres &gt; Confidentialité". La
                  suppression est définitive et irréversible.
                </li>
                <li>
                  <strong>Droit d'opposition</strong> : vous pouvez vous opposer
                  au traitement de vos données en nous contactant à l'adresse{' '}
                  <a
                    href="mailto:infoiut@iut.univ-paris8.fr"
                    className="text-primary hover:underline"
                  >
                    infoiut@iut.univ-paris8.fr
                  </a>
                </li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Vos données sont conservées tant que votre compte est actif.
                Après suppression de votre compte, toutes vos données sont
                définitivement effacées.
              </p>
            </section>

            <Separator />

            {/* Responsabilité du contenu */}
            <section>
              <h3 className="font-semibold text-base mb-2">
                4. Responsabilité et contenu
              </h3>
              <p className="text-muted-foreground mb-2">
                En utilisant Memora, vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  Être <strong>responsable du contenu</strong> que vous créez
                  (notes, flashcards, collections)
                </li>
                <li>
                  Ne pas publier de contenu{' '}
                  <strong>
                    illégal, diffamatoire, discriminatoire, haineux ou contraire
                    aux bonnes mœurs
                  </strong>
                </li>
                <li>
                  Respecter les{' '}
                  <strong>
                    droits d'auteur et la propriété intellectuelle
                  </strong>{' '}
                  d'autrui
                </li>
                <li>
                  Respecter les <strong>autres utilisateurs</strong> dans le
                  cadre du partage et de la collaboration
                </li>
                <li>
                  Ne pas utiliser l'application pour{' '}
                  <strong>harceler, menacer ou nuire</strong> à d'autres
                  utilisateurs
                </li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Vous êtes seul responsable de l'utilisation que vous faites de
                vos notes et du contenu que vous partagez.
              </p>
            </section>

            <Separator />

            {/* Signalement */}
            <section>
              <h3 className="font-semibold text-base mb-2">
                5. Signalement de contenu inapproprié
              </h3>
              <p className="text-muted-foreground mb-2">
                Si vous constatez qu'une note ou une collection partagée
                contient du contenu inapproprié, vous pouvez :
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  Signaler une note ou une collection via le boutton dédié
                </li>
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
                  Décrire précisément le problème et fournir des captures
                  d'écran si nécessaire
                </li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Les administrateurs examineront votre signalement et prendront
                les mesures appropriées si nécessaire (avertissement,
                suppression du contenu, suspension du compte).
              </p>
            </section>

            <Separator />

            {/* Sécurité */}
            <section>
              <h3 className="font-semibold text-base mb-2">
                6. Sécurité et confidentialité
              </h3>
              <p className="text-muted-foreground">
                Nous mettons en œuvre des mesures de sécurité techniques et
                organisationnelles pour protéger vos données contre tout accès,
                modification, divulgation ou destruction non autorisés. Les mots
                de passe sont chiffrés et ne sont jamais stockés en clair.
                Toutefois, aucun système n'est totalement infaillible et nous
                vous encourageons à choisir un mot de passe fort et unique.
              </p>
            </section>

            <Separator />

            {/* Modifications */}
            <section>
              <h3 className="font-semibold text-base mb-2">
                7. Modifications des CGU
              </h3>
              <p className="text-muted-foreground">
                Nous nous réservons le droit de modifier ces Conditions
                Générales d'Utilisation à tout moment. Vous serez informé de
                toute modification significative par e-mail ou via une
                notification dans l'application. Votre utilisation continue de
                Memora après ces modifications vaut acceptation des nouvelles
                conditions.
              </p>
            </section>

            <Separator />

            {/* Contact */}
            <section>
              <h3 className="font-semibold text-base mb-2">8. Contact</h3>
              <p className="text-muted-foreground">
                Pour toute question concernant ces Conditions Générales
                d'Utilisation, vos données personnelles, ou l'utilisation de
                Memora, vous pouvez nous contacter à :{' '}
                <a
                  href="mailto:infoiut@iut.univ-paris8.fr"
                  className="text-primary hover:underline"
                >
                  infoiut@iut.univ-paris8.fr
                </a>
              </p>
            </section>

            <Separator />

            {/* Acceptation */}
            <section>
              <p className="text-muted-foreground italic">
                En cochant la case "J'accepte les Conditions Générales
                d'Utilisation" lors de votre inscription, vous reconnaissez
                avoir lu, compris et accepté l'ensemble de ces conditions.
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Dernière mise à jour : Janvier 2026
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
