import { AuthIntroPanel } from "@/features/auth/components/AuthIntroPanel"

const HIGHLIGHTS = [
  {
    title: "Collections",
    description: "Classez vos notes avec des descriptions et des statuts de visibilité.",
  },
  {
    title: "Graphe",
    description: "Visualisez vos liens pour mieux comprendre vos connexions.",
  },
  {
    title: "Notes collaboratives",
    description: "Gardez vos fiches privées ou partagez-les si besoin.",
  },
  {
    title: "Suivi des révisions",
    description: "Planifiez des sessions et mesurez votre progression.",
  },
]

export function RegisterIntro() {
  return (
    <AuthIntroPanel
      kicker="Memora"
      title="Construisez votre base dès maintenant."
      description="Les collections, la révision programmée et la recherche avancée sont prêtes à accueillir vos idées."
      highlights={HIGHLIGHTS}
    />
  )
}

