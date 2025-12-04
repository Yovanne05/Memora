import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { CollectionsSort, CollectionsTab } from "../../lib/collections-query"
import type { CollectionVisibility } from "../../models/collection.model"
import { forwardRef } from "react"

interface CollectionsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  tab: CollectionsTab
  onTabChange: (value: CollectionsTab) => void
  sort: CollectionsSort
  onSortChange: (value: CollectionsSort) => void
  visibilityFilter?: CollectionVisibility
  onVisibilityFilterChange: (value: CollectionVisibility | undefined) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export const CollectionsToolbar = forwardRef<HTMLInputElement, CollectionsToolbarProps>(
  function CollectionsToolbar(
    {
      search,
      onSearchChange,
      tab,
      onTabChange,
      sort,
      onSortChange,
      visibilityFilter,
      onVisibilityFilterChange,
      showFilters,
      onToggleFilters,
    },
    ref
  ) {
    const activeFiltersCount = visibilityFilter ? 1 : 0

    return (
      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full min-w-60 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={ref}
              placeholder="Rechercher des collections..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={tab}
            onValueChange={(value) =>
              onTabChange(value === "shared" ? "shared" : "mine")
            }
            className="w-full md:w-auto"
          >
            <TabsList className="grid h-9 grid-cols-2">
              <TabsTrigger value="mine">Mes collections</TabsTrigger>
              <TabsTrigger value="shared">Partagées avec moi</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={sort}
            onValueChange={(value: CollectionsSort) => onSortChange(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récentes</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
              <SelectItem value="notes-count">Nombre de notes</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={onToggleFilters}
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
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
          <div className="text-sm font-medium text-muted-foreground">Visibilité :</div>
          <div className="flex gap-2">
            <Button
              variant={visibilityFilter === "private" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onVisibilityFilterChange(
                  visibilityFilter === "private" ? undefined : "private"
                )
              }
            >
              Privée
            </Button>
            <Button
              variant={visibilityFilter === "public" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onVisibilityFilterChange(
                  visibilityFilter === "public" ? undefined : "public"
                )
              }
            >
              Publique
            </Button>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVisibilityFilterChange(undefined)}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
)
