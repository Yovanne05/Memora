import { Filter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type CollectionsFilterButtonProps = {
  showFilters: boolean
  activeFiltersCount: number
  onToggle: () => void
}

export function CollectionsFilterButton({
  showFilters,
  activeFiltersCount,
  onToggle,
}: Readonly<CollectionsFilterButtonProps>) {
  return (
    <Button
      variant={showFilters ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="relative"
    >
      <Filter className="h-4 w-4 mr-2" />
      Filtres
      {activeFiltersCount > 0 && (
        <Badge
          variant="secondary"
          className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
        >
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  )
}
