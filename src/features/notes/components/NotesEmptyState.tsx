import { FileText } from "lucide-react"

export function NotesEmptyState() {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-center">
      <FileText className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-medium text-foreground">Aucune note trouvée</p>
        <p className="text-sm text-muted-foreground">Essayez d’ajuster les filtres ou créez une nouvelle note.</p>
      </div>
    </div>
  )
}

