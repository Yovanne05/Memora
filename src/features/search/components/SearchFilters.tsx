import { useId } from 'react'
import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/ui/tag-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SearchFilters as SearchFiltersType } from '../types/search-query'

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
    filters.type !== 'all' ||
    (filters.tags && filters.tags.length > 0)

  return (
    <div className={cn('space-y-4', className)}>
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
        {/* Type de contenu */}
        <div className="space-y-2">
          <label htmlFor={typeId} className="text-sm font-medium">Type de contenu</label>
          <Select
            value={filters.type ?? 'all'}
            onValueChange={(value) =>
              onChange({ type: value as SearchFiltersType['type'] })
            }
          >
            <SelectTrigger id={typeId} className="w-full">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="collection">Collections</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tri */}
        <div className="space-y-2">
          <label htmlFor={sortById} className="text-sm font-medium">Trier par</label>
          <Select
            value={filters.sortBy ?? 'date'}
            onValueChange={(value) =>
              onChange({ sortBy: value as SearchFiltersType['sortBy'] })
            }
          >
            <SelectTrigger id={sortById} className="w-full">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="alphabetical">Alphabétique</SelectItem>
              <SelectItem value="relevance">Pertinence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ordre */}
        <div className="space-y-2">
          <label htmlFor={sortDirId} className="text-sm font-medium">Ordre</label>
          <Select
            value={filters.sortDir ?? 'desc'}
            onValueChange={(value) =>
              onChange({ sortDir: value as SearchFiltersType['sortDir'] })
            }
          >
            <SelectTrigger id={sortDirId} className="w-full">
              <SelectValue placeholder="Décroissant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Décroissant</SelectItem>
              <SelectItem value="asc">Croissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor={tagsId} className="text-sm font-medium">Filtrer par tags</label>
        <TagInput
          id={tagsId}
          value={filters.tags ?? []}
          onChange={(tags) => onChange({ tags })}
          placeholder="Ajouter un tag..."
          maxTags={10}
        />
      </div>
    </div>
  )
}
