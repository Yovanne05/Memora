import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CollectionVisibility } from "../../models/collection.model"

type CollectionsVisibilityFiltersProps = {
  visibilityFilter?: CollectionVisibility
  onChange: (value: CollectionVisibility | undefined) => void
  activeFiltersCount: number
}

export function CollectionsVisibilityFilters({
  visibilityFilter,
  onChange,
  activeFiltersCount,
}: Readonly<CollectionsVisibilityFiltersProps>) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
      <div className="text-sm font-medium text-muted-foreground">Visibilité :</div>
      <div className="flex gap-2">
        <Button
          variant={visibilityFilter === "private" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            onChange(visibilityFilter === "private" ? undefined : "private")
          }
        >
          Privée
        </Button>
        <Button
          variant={visibilityFilter === "public" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            onChange(visibilityFilter === "public" ? undefined : "public")
          }
        >
          Publique
        </Button>
      </div>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(undefined)}
          className="ml-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
