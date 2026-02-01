import { Flag } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

type NoteQuickActionsReportItemProps = {
  isPending: boolean
  onOpenReport: () => void
}

export function NoteQuickActionsReportItem({
  isPending,
  onOpenReport,
}: Readonly<NoteQuickActionsReportItemProps>) {
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onOpenReport()
      }}
    >
      <Flag className="mr-2 h-4 w-4" />
      Signaler
    </DropdownMenuItem>
  )
}
