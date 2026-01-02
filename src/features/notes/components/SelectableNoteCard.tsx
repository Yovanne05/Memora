import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Note } from "../models/note.model"
import { NoteCard } from "./list/NoteCard"

interface SelectableNoteCardProps {
  readonly note: Note
  readonly isSelected: boolean
  readonly onToggleSelection: (noteId: string) => void
  readonly onActionComplete?: () => void
  readonly selectionMode: boolean
}

export function SelectableNoteCard({
  note,
  isSelected,
  onToggleSelection,
  onActionComplete,
  selectionMode
}: Readonly<SelectableNoteCardProps>) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSelection(note.id)
  }

  return (
    <div
      className={cn(
        "relative transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={selectionMode ? () => onToggleSelection(note.id) : undefined}
    >
      {selectionMode && (
        <div
          className="absolute top-3 left-3 z-10"
          onClick={handleCheckboxClick}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(note.id)}
            className="bg-background border-2 shadow-sm"
          />
        </div>
      )}
      <NoteCard note={note} onActionComplete={onActionComplete} />
    </div>
  )
}
