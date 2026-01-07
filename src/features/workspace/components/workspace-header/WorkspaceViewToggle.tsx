import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type WorkspaceViewToggleProps = {
  view: "grid" | "list"
  onChange: (value: "grid" | "list") => void
}

export function WorkspaceViewToggle({
  view,
  onChange,
}: Readonly<WorkspaceViewToggleProps>) {
  return (
    <div className="flex rounded-md border">
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-r-none", view === "grid" && "bg-accent")}
        onClick={() => onChange("grid")}
        aria-label="Vue grille"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-l-none border-l", view === "list" && "bg-accent")}
        onClick={() => onChange("list")}
        aria-label="Vue liste"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}
