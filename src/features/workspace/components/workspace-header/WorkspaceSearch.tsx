import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type WorkspaceSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function WorkspaceSearch({ value, onChange }: Readonly<WorkspaceSearchProps>) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-64 pl-8"
      />
    </div>
  )
}
