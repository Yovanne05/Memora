import { AuthIntroPanel } from "../components/AuthIntroPanel"

const HIGHLIGHTS = [
  {
    title: "Synchronisation rapide",
    description: "Vos collections et fiches restent alignées sur tous vos appareils.",
  },
  {
    title: "Révision intelligente",
    description: "Programmez vos sessions de révision depuis le même tableau de bord.",
  },
  {
    title: "Recherche boostée",
    description: "Filtrez par tags, visibilité ou propriétaire en quelques clics.",
  },
  {
    title: "Partage maîtrisé",
    description: "Gardez le contrôle avec les droits privés ou publics de chaque note.",
  },
]

export function LoginIntro() {
  return (
    <AuthIntroPanel
      kicker="Memora"
      title="Retrouver vos notes devient un réflexe, pas une corvée."
      description="Centralisez vos idées, vos cours et vos découvertes dans un espace qui reste clair, connecté et prêt à être révisé."
      highlights={HIGHLIGHTS}
    />
  )
}
