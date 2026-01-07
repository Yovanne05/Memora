import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Note } from "../../models/note.model"
import type { Collection } from "@/features/collections/models/collection.model"
import { NoteQuickActionsMenuContent } from "./NoteQuickActionsMenuContent"
import { NoteQuickActionsTrigger } from "./NoteQuickActionsTrigger"

type NoteQuickActionsMenuProps = {
  note: Note
  collections: Collection[]
  isPending: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleVisibility: () => void
  onMoveToCollection: (collectionId: string | null) => void
  onOpenShare: () => void
  onDuplicate: () => void
  onOpenDelete: () => void
  triggerVariant: "ghost" | "outline" | "default"
  showLabel: boolean
}

export function NoteQuickActionsMenu({
  note,
  collections,
  isPending,
  open,
  onOpenChange,
  onToggleVisibility,
  onMoveToCollection,
  onOpenShare,
  onDuplicate,
  onOpenDelete,
  triggerVariant,
  showLabel,
}: Readonly<NoteQuickActionsMenuProps>) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <NoteQuickActionsTrigger
          isPending={isPending}
          triggerVariant={triggerVariant}
          showLabel={showLabel}
        />
      </DropdownMenuTrigger>
      <NoteQuickActionsMenuContent
        note={note}
        collections={collections}
        isPending={isPending}
        onToggleVisibility={onToggleVisibility}
        onMoveToCollection={onMoveToCollection}
        onOpenShare={onOpenShare}
        onDuplicate={onDuplicate}
        onOpenDelete={onOpenDelete}
      />
    </DropdownMenu>
  )
}
