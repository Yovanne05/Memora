import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import type { CollectionsSort, CollectionsTab } from "../lib/collections-query"

interface CollectionsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  tab: CollectionsTab
  onTabChange: (value: CollectionsTab) => void
  sort: CollectionsSort
  onSortChange: (value: CollectionsSort) => void
}

export function CollectionsToolbar({
  search,
  onSearchChange,
  tab,
  onTabChange,
  sort,
  onSortChange,
}: CollectionsToolbarProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full min-w-60 lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
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
            onValueChange={(value: "recent" | "alphabetical") => onSortChange(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récentes</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
