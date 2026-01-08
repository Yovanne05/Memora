import { Fragment } from 'react'
import { Copy, Trash2, Users } from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { Note } from '../../models/note.model'
import type { Collection } from '@/features/collections/models/collection.model'
import { NoteQuickActionsMoveSubmenu } from './NoteQuickActionsMoveSubmenu'
import { NoteQuickActionsVisibilityItem } from './NoteQuickActionsVisibilityItem'

type NoteQuickActionsMenuContentProps = {
  note: Note
  collections: Collection[]
  isPending: boolean
  onToggleVisibility: () => void
  onMoveToCollection: (collectionId: string | null) => void
  onOpenShare: () => void
  onDuplicate: () => void
  onOpenDelete: () => void
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
  canMove,
  canToggleVisibility,
  canShare,
  canDuplicate,
  canDelete,
}: Readonly<NoteQuickActionsMenuContentProps>) {
  const menuItems: { key: string; node: JSX.Element }[] = []

  if (canToggleVisibility) {
    menuItems.push({
      key: 'visibility',
      node: (
        <NoteQuickActionsVisibilityItem
          note={note}
          isPending={isPending}
          onToggleVisibility={onToggleVisibility}
        />
      ),
    })
  }

  if (canShare) {
    menuItems.push({
      key: 'share',
      node: (
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
      ),
    })
  }

  if (canMove) {
    menuItems.push({
      key: 'move',
      node: (
        <NoteQuickActionsMoveSubmenu
          note={note}
          collections={collections}
          isPending={isPending}
          onMoveToCollection={onMoveToCollection}
        />
      ),
    })
  }

  if (canDuplicate) {
    menuItems.push({
      key: 'duplicate',
      node: (
        <DropdownMenuItem
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onDuplicate()
          }}
          disabled={isPending}
        >
          <Copy className="h-4 w-4" />
          Dupliquer
        </DropdownMenuItem>
      ),
    })
  }

  if (canDelete) {
    menuItems.push({
      key: 'delete',
      node: (
        <DropdownMenuItem
          variant="destructive"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onOpenDelete()
          }}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      ),
    })
  }

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
