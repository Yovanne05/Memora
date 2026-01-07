import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type QuickLinkNoteSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function QuickLinkNoteSearch({ value, onChange }: Readonly<QuickLinkNoteSearchProps>) {
  return (
    <div className="p-3 border-b">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une note..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-8 h-9"
          autoFocus
        />
      </div>
    </div>
  )
}
