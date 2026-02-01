import { Users } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

type NoteQuickActionsShareItemProps = {
  isPending: boolean
  onOpenShare: () => void
}

export function NoteQuickActionsShareItem({
  isPending,
  onOpenShare,
}: Readonly<NoteQuickActionsShareItemProps>) {
  return (
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
  )
}
