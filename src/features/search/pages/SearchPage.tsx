import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { SearchInput } from '../components/SearchInput'
import { SearchFilters } from '../components/SearchFilters'
import { SearchResults } from '../components/SearchResults'
import { useSearchManager } from '../hooks/useSearchManager'

export default function SearchPage() {
  const manager = useSearchManager()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Recherche</h1>
          <p className="text-muted-foreground">
            Recherchez parmi vos collections et notes publiques
          </p>
        </div>
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Search Input */}
      <SearchInput
        value={manager.query}
        onChange={manager.setQuery}
        placeholder="Rechercher des collections, notes, tags..."
        className="max-w-2xl"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilters
            filters={manager.filters}
            onChange={manager.updateFilters}
            onReset={manager.resetFilters}
          />
        </CardContent>
      </Card>

      {/* Results Count */}
      {manager.hasSearched && !manager.isLoading && (
        <div className="text-sm text-muted-foreground">
          {manager.total} résultat{manager.total > 1 ? 's' : ''} trouvé{manager.total > 1 ? 's' : ''}
        </div>
      )}

      {/* Results */}
      <SearchResults
        results={manager.results}
        isLoading={manager.isLoading}
        isEmpty={manager.isEmpty}
        hasSearched={manager.hasSearched}
      />

      {/* Pagination */}
      {manager.hasSearched && !manager.isLoading && manager.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => manager.setPage(Math.max(0, manager.page - 1))}
                aria-disabled={manager.page === 0}
                className={manager.page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: manager.totalPages }, (_, i) => i)
              .filter((i) => {
                // Afficher les 3 premières pages, 3 dernières, et 2 autour de la page actuelle
                return (
                  i < 3 ||
                  i >= manager.totalPages - 3 ||
                  Math.abs(i - manager.page) <= 1
                )
              })
              .map((i, idx, arr) => {
                // Ajouter des ellipses
                const showEllipsisBefore = idx > 0 && arr[idx - 1] !== i - 1
                const showEllipsisAfter = idx < arr.length - 1 && arr[idx + 1] !== i + 1

                return (
                  <div key={i} className="flex items-center">
                    {showEllipsisBefore && (
                      <PaginationItem>
                        <span className="px-2 text-muted-foreground">...</span>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => manager.setPage(i)}
                        isActive={manager.page === i}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                    {showEllipsisAfter && (
                      <PaginationItem>
                        <span className="px-2 text-muted-foreground">...</span>
                      </PaginationItem>
                    )}
                  </div>
                )
              })}

            <PaginationItem>
              <PaginationNext
                onClick={() => manager.setPage(Math.min(manager.totalPages - 1, manager.page + 1))}
                aria-disabled={manager.page >= manager.totalPages - 1}
                className={
                  manager.page >= manager.totalPages - 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
