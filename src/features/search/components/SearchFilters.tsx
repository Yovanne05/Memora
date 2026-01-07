import { useId } from "react"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SearchFilters as SearchFiltersType } from "../types/search-query"
import { FilterSelectField } from "./search-filters/FilterSelectField"
import { TagsFilter } from "./search-filters/TagsFilter"
import {
  ORDER_OPTIONS,
  SORT_OPTIONS,
  TYPE_OPTIONS,
} from "../types/search-filters.constants"

interface SearchFiltersProps {
  readonly filters: SearchFiltersType
  readonly onChange: (filters: Partial<SearchFiltersType>) => void
  readonly onReset?: () => void
  readonly className?: string
}

export function SearchFilters({
  filters,
  onChange,
  onReset,
  className,
}: Readonly<SearchFiltersProps>) {
  const typeId = useId()
  const sortById = useId()
  const sortDirId = useId()
  const tagsId = useId()

  const hasActiveFilters =
    filters.type !== "all" || (filters.tags && filters.tags.length > 0)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filtres
        </div>
        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FilterSelectField
          id={typeId}
          label="Type de contenu"
          value={filters.type ?? "all"}
          placeholder="Tous"
          options={TYPE_OPTIONS}
          onChange={(value) =>
            onChange({ type: value as SearchFiltersType["type"] })
          }
        />
        <FilterSelectField
          id={sortById}
          label="Trier par"
          value={filters.sortBy ?? "date"}
          placeholder="Date"
          options={SORT_OPTIONS}
          onChange={(value) =>
            onChange({ sortBy: value as SearchFiltersType["sortBy"] })
          }
        />
        <FilterSelectField
          id={sortDirId}
          label="Ordre"
          value={filters.sortDir ?? "desc"}
          placeholder="Décroissant"
          options={ORDER_OPTIONS}
          onChange={(value) =>
            onChange({ sortDir: value as SearchFiltersType["sortDir"] })
          }
        />
      </div>

      <TagsFilter
        id={tagsId}
        tags={filters.tags ?? []}
        onChange={(tags) => onChange({ tags })}
      />
    </div>
  )
}



