type SearchSummaryProps = {
  total: number
  hasSearched: boolean
  isLoading: boolean
}

export function SearchSummary({
  total,
  hasSearched,
  isLoading,
}: Readonly<SearchSummaryProps>) {
  if (!hasSearched || isLoading) {
    return null
  }

  return (
    <div className="text-sm text-muted-foreground">
      {total} résultat{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
    </div>
  )
}
