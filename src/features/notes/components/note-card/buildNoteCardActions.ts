import type { ResourceCardAction } from "@/components/shared/ResourceCard"
import type { Note } from "../../models/note.model"

type BuildNoteCardActionsArgs = {
  note: Note
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
  showQuickActions: boolean
}

export function buildNoteCardActions({
  note,
  onEdit,
  onDelete,
  showQuickActions,
}: BuildNoteCardActionsArgs) {
  const actions: ResourceCardAction[] = []

  if (!showQuickActions) {
    if (onEdit) {
      actions.push({
        label: "Modifier",
        onClick: (event) => {
          event.preventDefault()
          onEdit(note)
        },
      })
    }
    if (onDelete) {
      actions.push({
        label: "Supprimer",
        variant: "destructive",
        onClick: (event) => {
          event.preventDefault()
          onDelete(note)
        },
      })
    }
  }

  return actions
}
