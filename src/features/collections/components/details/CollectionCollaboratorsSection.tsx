import { Users2, Lock } from "lucide-react"

export function CollectionCollaboratorsSection() {
  return (
    <div className="rounded-xl border border-border bg-card/50 px-6 py-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Users2 className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold">Collaborateurs</h2>
      </div>
      <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
        <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Collection privée</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            L'interface de collaboration arrivera bientôt. Cette collection vous appartient actuellement.
          </p>
        </div>
      </div>
    </div>
  )
}
