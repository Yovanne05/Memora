import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Note } from '../../models/note.model'
import type { Collection } from '@/features/collections/models/collection.model'
import { NoteQuickActionsMenuContent } from './NoteQuickActionsMenuContent'

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
  onOpenReport: () => void
  triggerVariant: 'ghost' | 'outline' | 'default'
  showLabel: boolean
  canMove: boolean
  canToggleVisibility: boolean
  canShare: boolean
  canDuplicate: boolean
  canDelete: boolean
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
  onOpenReport,
  triggerVariant,
  showLabel,
  canMove,
  canToggleVisibility,
  canShare,
  canDuplicate,
  canDelete,
}: Readonly<NoteQuickActionsMenuProps>) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={triggerVariant}
          size={showLabel ? 'sm' : 'icon'}
          className={showLabel ? 'gap-2' : ''}
          disabled={isPending}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <MoreVertical className="h-4 w-4" />
          {showLabel && 'Actions'}
        </Button>
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
        onOpenReport={onOpenReport}
        canMove={canMove}
        canToggleVisibility={canToggleVisibility}
        canShare={canShare}
        canDuplicate={canDuplicate}
        canDelete={canDelete}
      />
    </DropdownMenu>
  )
}
