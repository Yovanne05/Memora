import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CollectionsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  tab: "mine" | "shared"
  onTabChange: (value: "mine" | "shared") => void
  sort: "recent" | "alphabetical"
  onSortChange: (value: "recent" | "alphabetical") => void
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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search collections..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="hidden text-sm font-medium text-slate-500 md:block">
          or filter:
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <Tabs
          value={tab}
          onValueChange={(value) =>
            onTabChange(value === "shared" ? "shared" : "mine")
          }
          className="w-full md:w-auto"
        >
          <TabsList className="grid h-9 w-full grid-cols-2">
            <TabsTrigger value="mine">My Collections</TabsTrigger>
            <TabsTrigger value="shared">Shared with me</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={sort}
          onValueChange={(value: "recent" | "alphabetical") =>
            onSortChange(value)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="alphabetical">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
