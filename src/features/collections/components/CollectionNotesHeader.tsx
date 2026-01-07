import { Input } from "@/components/ui/input"
import { FormSelect } from "@/components/ui/form-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SortAsc, FileText, Plus } from "lucide-react"
import type { AvailableNoteOption, NotesSort } from "../types/note.types"

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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold">Notes de la collection</h2>
        </div>
        <Select value={sortValue} onValueChange={(value: NotesSort) => onSortChange(value)}>
          <SelectTrigger className="w-full sm:w-48 shadow-sm">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récentes</SelectItem>
            <SelectItem value="alphabetical">Alphabétique (A-Z)</SelectItem>
            <SelectItem value="oldest">Plus anciennes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-1.5">
          <label htmlFor="notes-search" className="text-sm font-medium text-foreground">
            Rechercher
          </label>
          <Input
            id="notes-search"
            placeholder="Rechercher par titre ou contenu..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={availableNotes.length === 0}
            className="shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="add-note" className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Ajouter une note
          </label>
          <FormSelect
            id="add-note"
            label=""
            placeholder={isAdding ? "Ajout en cours..." : "Sélectionner une note"}
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
    </div>
  )
}
