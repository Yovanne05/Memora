import { Copy, Trash2, Users } from "lucide-react"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Note } from "../../models/note.model"
import type { Collection } from "@/features/collections/models/collection.model"
import { NoteQuickActionsMoveSubmenu } from "./NoteQuickActionsMoveSubmenu"
import { NoteQuickActionsVisibilityItem } from "./NoteQuickActionsVisibilityItem"

type NoteQuickActionsMenuContentProps = {
  note: Note
  collections: Collection[]
  isPending: boolean
  onToggleVisibility: () => void
  onMoveToCollection: (collectionId: string | null) => void
  onOpenShare: () => void
  onDuplicate: () => void
  onOpenDelete: () => void
}

export function NoteQuickActionsMenuContent({
  note,
  collections,
  isPending,
  onToggleVisibility,
  onMoveToCollection,
  onOpenShare,
  onDuplicate,
  onOpenDelete,
}: Readonly<NoteQuickActionsMenuContentProps>) {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <NoteQuickActionsVisibilityItem
        note={note}
        isPending={isPending}
        onToggleVisibility={onToggleVisibility}
      />

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onOpenShare()
        }}
        disabled={isPending}
      >
        <Users className="h-4 w-4" />
        Partager
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <NoteQuickActionsMoveSubmenu
        note={note}
        collections={collections}
        isPending={isPending}
        onMoveToCollection={onMoveToCollection}
      />

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={onDuplicate} disabled={isPending}>
        <Copy className="h-4 w-4" />
        Dupliquer
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem variant="destructive" onClick={onOpenDelete} disabled={isPending}>
        <Trash2 className="h-4 w-4" />
        Supprimer
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
