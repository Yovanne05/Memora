import { Fragment } from 'react'
import {
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { Note } from '../../models/note.model'
import type { Collection } from '@/features/collections/models/collection.model'
import { useNoteQuickActionsMenuItems } from './useNoteQuickActionsMenuItems'

type NoteQuickActionsMenuContentProps = {
  note: Note
  collections: Collection[]
  isPending: boolean
  onToggleVisibility: () => void
  onMoveToCollection: (collectionId: string | null) => void
  onOpenShare: () => void
  onDuplicate: () => void
  onOpenDelete: () => void
  onOpenReport: () => void
  canMove: boolean
  canToggleVisibility: boolean
  canShare: boolean
  canDuplicate: boolean
  canDelete: boolean
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
  onOpenReport,
  canMove,
  canToggleVisibility,
  canShare,
  canDuplicate,
  canDelete,
}: Readonly<NoteQuickActionsMenuContentProps>) {
  const menuItems = useNoteQuickActionsMenuItems({
    note,
    collections,
    isPending,
    onToggleVisibility,
    onMoveToCollection,
    onOpenShare,
    onDuplicate,
    onOpenDelete,
    onOpenReport,
    canMove,
    canToggleVisibility,
    canShare,
    canDuplicate,
    canDelete,
  })

  return (
    <DropdownMenuContent align="end" className="w-56">
      {menuItems.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 && <DropdownMenuSeparator />}
          {item.node}
        </Fragment>
      ))}
    </DropdownMenuContent>
  )
}
