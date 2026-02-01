import { AlertCircle } from "lucide-react"

export function FlashcardsError() {
  return (
    <div className="flex items-center gap-2 py-4 px-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p className="text-sm">Erreur lors du chargement des flashcards</p>
    </div>
  )
}
