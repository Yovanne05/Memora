import { Copy } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

type NoteQuickActionsDuplicateItemProps = {
  isPending: boolean
  onDuplicate: () => void
}

export function NoteQuickActionsDuplicateItem({
  isPending,
  onDuplicate,
}: Readonly<NoteQuickActionsDuplicateItemProps>) {
  return (
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
  )
}
