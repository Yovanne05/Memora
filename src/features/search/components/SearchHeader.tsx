import { Search } from "lucide-react"

export function SearchHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Recherche</h1>
        <p className="text-muted-foreground">
          Recherchez parmi vos collections et notes publiques
        </p>
      </div>
      <Search className="h-8 w-8 text-muted-foreground" />
    </div>
  )
}
