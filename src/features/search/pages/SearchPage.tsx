import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaginationComponent } from "@/components/ui/pagination-component"
import { SearchFilters } from "../components/SearchFilters"
import { SearchInput } from "../components/SearchInput"
import { SearchResults } from "../components/SearchResults"
import { useSearchManager } from "../hooks/useSearchManager"
import { SearchHeader } from "../components/SearchHeader"
import { SearchSummary } from "../components/SearchSummary"

export default function SearchPage() {
  const manager = useSearchManager()

  return (
    <div className="space-y-6 p-6">
      <SearchHeader />

      <SearchInput
        value={manager.query}
        onChange={manager.setQuery}
        placeholder="Rechercher des collections, notes, tags..."
        className="max-w-2xl"
      />

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

      <SearchSummary
        total={manager.total}
        hasSearched={manager.hasSearched}
        isLoading={manager.isLoading}
      />

      <SearchResults
        results={manager.results}
        isLoading={manager.isLoading}
        isEmpty={manager.isEmpty}
        hasSearched={manager.hasSearched}
      />

      {manager.hasSearched && !manager.isLoading && manager.totalPages > 1 && (
        <PaginationComponent
          page={manager.page}
          maxPage={manager.totalPages - 1}
          setPage={manager.setPage}
        />
      )}
    </div>
  )
}
