import { Search, LayoutGrid, List, Network } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { useCollectionQuery } from "@/features/collections/hooks/useCollectionQuery"
import { useNoteQuery } from "@/features/notes/hooks/useNoteQuery"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"

export function WorkspaceHeader() {
  const { state, actions } = useWorkspaceContext()

  const collectionQuery = useCollectionQuery(state.selectedCollectionId || "")
  const noteQuery = useNoteQuery(state.selectedNoteId || "")

  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; href?: string }> = [
      { label: "Workspace", href: "/app/workspace" },
    ]

    if (state.selectedCollectionId && collectionQuery.data) {
      items.push({
        label: collectionQuery.data.name,
        href: `/app/workspace/collections/${state.selectedCollectionId}`,
      })
    }

    if (state.selectedNoteId && noteQuery.data) {
      items.push({
        label: noteQuery.data.title || "Sans titre",
      })
    }

    return items
  }, [
    state.selectedCollectionId,
    state.selectedNoteId,
    collectionQuery.data,
    noteQuery.data,
  ])

  return (
    <header className="border-b bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="contents">
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={state.search}
              onChange={(e) => actions.setSearch(e.target.value)}
              className="w-64 pl-8"
            />
          </div>

          {/* View toggle (only if not on note edit) */}
          {!state.selectedNoteId && (
            <div className="flex rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-r-none",
                  state.view === "grid" && "bg-accent"
                )}
                onClick={() => actions.setView("grid")}
                aria-label="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-l-none border-l",
                  state.view === "list" && "bg-accent"
                )}
                onClick={() => actions.setView("list")}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Graph view button */}
          <Button
            variant="outline"
            size="sm"
            onClick={actions.openGraphView}
            className="gap-2"
          >
            <Network className="h-4 w-4" />
            Graphe
          </Button>
        </div>
      </div>
    </header>
  )
}
