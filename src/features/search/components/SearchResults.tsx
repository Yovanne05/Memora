import { SearchResultCard } from './SearchResultCard'
import { Loader2, Search } from 'lucide-react'
import type { SearchResult } from '../types/search.types'
import { cn } from '@/lib/utils'

interface SearchResultsProps {
  readonly results: SearchResult[]
  readonly isLoading?: boolean
  readonly isEmpty?: boolean
  readonly hasSearched?: boolean
  readonly className?: string
}

export function SearchResults({
  results,
  isLoading,
  isEmpty,
  hasSearched,
  className,
}: Readonly<SearchResultsProps>) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Recherche en cours...</p>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Search className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          Entrez au moins 2 caractères pour lancer une recherche
        </p>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Search className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">Aucun résultat trouvé</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Essayez de modifier votre recherche ou vos filtres
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {results.map((result) => (
        <SearchResultCard key={`${result.type}-${result.item.id}`} result={result} />
      ))}
    </div>
  )
}
