import { Button } from "@/components/ui/button"
import { Trash2, Eye, EyeOff, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CollectionsBulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkDelete: () => void
  onBulkSetPrivate: () => void
  onBulkSetPublic: () => void
}

export function CollectionsBulkActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkSetPrivate,
  onBulkSetPublic,
}: CollectionsBulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-lg">
        <Badge variant="secondary" className="text-sm font-semibold">
          {selectedCount} sélectionnée{selectedCount > 1 ? "s" : ""}
        </Badge>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkSetPrivate}
            className="gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Rendre privée{selectedCount > 1 ? "s" : ""}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkSetPublic}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Rendre publique{selectedCount > 1 ? "s" : ""}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Annuler
        </Button>
      </div>
    </div>
  )
}
