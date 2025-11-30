import { Input } from "@/components/ui/input"
import { FormSelect } from "@/components/ui/form-select"
import type { AvailableNoteOption } from "../../types/note.types"

type CollectionNotesHeaderProps = {
  availableNotes: AvailableNoteOption[]
  selected: string
  isAdding: boolean
  onSelectNote: (noteId: string) => void
  searchValue: string
  onSearchChange: (value: string) => void
}

export function CollectionNotesHeader({
  availableNotes,
  selected,
  isAdding,
  onSelectNote,
  searchValue,
  onSearchChange,
}: CollectionNotesHeaderProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)] md:items-start">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">Notes</h2>
        <Input
          id="notes-search"
          placeholder="Rechercher des notes..."
          className="max-w-md"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={availableNotes.length === 0}
        />
      </div>

      <div className="space-y-1 md:justify-self-end">
        <FormSelect
          id="add-note"
          label="Nouvelle note"
          placeholder={isAdding ? "Ajout..." : "Sélectionner une note"}
          options={availableNotes.map((n) => ({
            value: n.id,
            label: n.title,
          }))}
          value={selected}
          onValueChange={onSelectNote}
          disabled={isAdding || availableNotes.length === 0}
        />
      </div>
    </div>
  )
}
