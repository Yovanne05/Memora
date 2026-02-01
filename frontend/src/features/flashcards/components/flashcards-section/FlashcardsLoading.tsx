import { Loader2 } from "lucide-react"

export function FlashcardsLoading() {
  return (
    <div className="flex items-center justify-center py-8 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      <span className="text-sm">Chargement des flashcards...</span>
    </div>
  )
}
