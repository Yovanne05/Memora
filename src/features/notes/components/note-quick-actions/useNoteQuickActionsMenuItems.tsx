import type { ReactElement } from 'react'
import type { Note } from '../../models/note.model'
import type { Collection } from '@/features/collections/models/collection.model'
import { NoteQuickActionsVisibilityItem } from './NoteQuickActionsVisibilityItem'
import { NoteQuickActionsShareItem } from './NoteQuickActionsShareItem'
import { NoteQuickActionsMoveSubmenu } from './NoteQuickActionsMoveSubmenu'
import { NoteQuickActionsDuplicateItem } from './NoteQuickActionsDuplicateItem'
import { NoteQuickActionsDeleteItem } from './NoteQuickActionsDeleteItem'

type MenuItem = { key: string; node: ReactElement }

type UseNoteQuickActionsMenuItemsParams = {
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

export function useNoteQuickActionsMenuItems(
  params: UseNoteQuickActionsMenuItemsParams
): MenuItem[] {
  const {
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
  } = params

  const menuItems: MenuItem[] = []

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
        <NoteQuickActionsShareItem
          isPending={isPending}
          onOpenShare={onOpenShare}
        />
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
        <NoteQuickActionsDuplicateItem
          isPending={isPending}
          onDuplicate={onDuplicate}
        />
      ),
    })
  }

  if (canDelete) {
    menuItems.push({
      key: 'delete',
      node: (
        <NoteQuickActionsDeleteItem
          isPending={isPending}
          onOpenDelete={onOpenDelete}
        />
      ),
    })
  }

  return menuItems
}
