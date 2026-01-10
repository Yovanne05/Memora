import { Trash2 } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

type NoteQuickActionsDeleteItemProps = {
  isPending: boolean
  onOpenDelete: () => void
}

export function NoteQuickActionsDeleteItem({
  isPending,
  onOpenDelete,
}: Readonly<NoteQuickActionsDeleteItemProps>) {
  return (
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
  )
}
