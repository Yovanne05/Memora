import { Input } from "@/components/ui/input"
import { FormSelect } from "@/components/ui/form-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SortAsc } from "lucide-react"
import type { AvailableNoteOption } from "../../types/note.types"

export type NotesSort = "recent" | "alphabetical" | "oldest"

type CollectionNotesHeaderProps = {
  availableNotes: AvailableNoteOption[]
  selected: string
  isAdding: boolean
  onSelectNote: (noteId: string) => void
  searchValue: string
  onSearchChange: (value: string) => void
  sortValue: NotesSort
  onSortChange: (value: NotesSort) => void
}

export function CollectionNotesHeader({
  availableNotes,
  selected,
  isAdding,
  onSelectNote,
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
}: CollectionNotesHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold">Notes</h2>
        <Select value={sortValue} onValueChange={(value: NotesSort) => onSortChange(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récentes</SelectItem>
            <SelectItem value="alphabetical">A-Z</SelectItem>
            <SelectItem value="oldest">Plus anciennes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)] md:items-end">
        <div className="space-y-1">
          <Input
            id="notes-search"
            placeholder="Rechercher des notes..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={availableNotes.length === 0}
          />
        </div>

        <FormSelect
          id="add-note"
          label="Ajouter une note"
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
