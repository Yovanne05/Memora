import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Search } from "lucide-react";
import type { FlashcardsSort, FlashcardsView } from "../../hooks/useFlashcardsManager";

interface FlashcardsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: FlashcardsSort;
  onSortChange: (value: FlashcardsSort) => void;
  view: FlashcardsView;
  onViewChange: (value: FlashcardsView) => void;
  onSubmitSearch?: () => void;
}

export function FlashcardsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  onSubmitSearch,
}: Readonly<FlashcardsToolbarProps>) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full min-w-60 lg:w-[28rem]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une flashcard..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmitSearch?.()}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={sort} onValueChange={(value: FlashcardsSort) => onSortChange(value)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Créées récemment</SelectItem>
              <SelectItem value="oldest">Créées en premier</SelectItem>
              <SelectItem value="question-asc">Question A-Z</SelectItem>
              <SelectItem value="question-desc">Question Z-A</SelectItem>
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
  );
}
