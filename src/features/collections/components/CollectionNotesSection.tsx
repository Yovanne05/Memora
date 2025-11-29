import { Input } from "@/components/ui/input"

export function CollectionNotesSection() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Notes</h2>
      <div className="flex gap-3">
        <Input
          placeholder="Rechercher des notes..."
          className="max-w-md"
          disabled
        />
      </div>
      <p className="text-xs text-muted-foreground">
        La liste des notes sera ajoutée plus tard.
      </p>
    </div>
  )
}
