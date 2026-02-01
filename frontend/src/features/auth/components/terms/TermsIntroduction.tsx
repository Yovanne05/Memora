import { Separator } from '@/components/ui/separator'

export function TermsIntroduction() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-2">
          1. Présentation de l'application
        </h3>
        <p className="text-muted-foreground">
          Memora est une application de gestion de notes et de connaissances
          développée dans le cadre d'un projet académique. Elle permet de
          créer, organiser et partager des notes, de les relier entre elles via
          un graphe de connaissances, et de réviser vos contenus grâce à un
          système de répétition espacée.
        </p>
      </section>
      <Separator />
    </>
  )
}
