import { Eye, EyeOff } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { Note } from "../../models/note.model"

type NoteQuickActionsVisibilityItemProps = {
  note: Note
  isPending: boolean
  onToggleVisibility: () => void
}

export function NoteQuickActionsVisibilityItem({
  note,
  isPending,
  onToggleVisibility,
}: Readonly<NoteQuickActionsVisibilityItemProps>) {
  return (
    <DropdownMenuItem onClick={onToggleVisibility} disabled={isPending}>
      {note.visibility === "private" ? (
        <>
          <Eye className="h-4 w-4" />
          Rendre publique
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          Rendre privée
        </>
      )}
    </DropdownMenuItem>
  )
}
