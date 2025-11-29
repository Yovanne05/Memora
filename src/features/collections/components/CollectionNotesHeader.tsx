import { FormSelect } from "@/components/ui/form-select"
import type { AvailableNoteOption } from "../types/note.types"

type CollectionNotesHeaderProps = {
  availableNotes: AvailableNoteOption[]
  selected: string
  isAdding: boolean
  onSelectNote: (noteId: string) => void
}

export function CollectionNotesHeader({
  availableNotes,
  selected,
  isAdding,
  onSelectNote,
}: CollectionNotesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold">Notes</h2>
      <div className="flex items-center gap-2">
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
