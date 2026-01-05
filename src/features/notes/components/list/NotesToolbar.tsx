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
import { LayoutGrid, List, Search } from "lucide-react"
import type { NotesScope, NotesSort, NotesView } from "../../hooks/useNotesManager"
import type { NotesFilters } from "../../types/note-query"

type NotesTabValue = "all" | "favorites" | "public" | "private"

interface NotesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: NotesSort
  onSortChange: (value: NotesSort) => void
  visibility: NotesFilters["visibility"]
  onVisibilityChange: (value: NotesFilters["visibility"]) => void
  view: NotesView
  onViewChange: (value: NotesView) => void

  scope: NotesScope
  onScopeChange: (value: NotesScope) => void

  onSubmitSearch?: () => void
}

function deriveTabsValue(scope: NotesScope, visibility: NotesFilters["visibility"]): NotesTabValue {
  if (scope === "favorites") return "favorites"
  if (visibility === "public") return "public"
  if (visibility === "private") return "private"
  return "all"
}

export function NotesToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  visibility,
  onVisibilityChange,
  view,
  onViewChange,
  scope,
  onScopeChange,
  onSubmitSearch,
}: Readonly<NotesToolbarProps>) {
  const tabValue = deriveTabsValue(scope, visibility)

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full min-w-60 lg:w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une note..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmitSearch?.()}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={tabValue}
            onValueChange={(value) => {
              const v = value as NotesTabValue

              if (v === "favorites") {
                onScopeChange("favorites")
                onVisibilityChange(undefined)
                return
              }

              if (v === "public") {
                onScopeChange("all")
                onVisibilityChange("public")
                return
              }

              if (v === "private") {
                onScopeChange("all")
                onVisibilityChange("private")
                return
              }

              onScopeChange("all")
              onVisibilityChange(undefined)
            }}
            className="w-full md:w-auto"
          >
            <TabsList className="grid h-9 grid-cols-4">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="favorites">Mes favoris</TabsTrigger>
              <TabsTrigger value="public">Publiques</TabsTrigger>
              <TabsTrigger value="private">Privées</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sort} onValueChange={(value: NotesSort) => onSortChange(value)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Modifiées récemment</SelectItem>
              <SelectItem value="oldest">Modifiées en premier</SelectItem>
              <SelectItem value="title-asc">Titre A-Z</SelectItem>
              <SelectItem value="title-desc">Titre Z-A</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 rounded-md border border-border/80 bg-muted/50 p-1">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
