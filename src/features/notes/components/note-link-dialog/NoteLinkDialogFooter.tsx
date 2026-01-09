import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

type NoteLinkDialogFooterProps = {
  isPending: boolean
  isDisabled: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function NoteLinkDialogFooter({
  isPending,
  isDisabled,
  onCancel,
  onSubmit,
}: Readonly<NoteLinkDialogFooterProps>) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Annuler
      </Button>
      <Button onClick={onSubmit} disabled={isDisabled}>
        {isPending ? 'Liaison...' : 'Lier la note'}
      </Button>
    </DialogFooter>
  )
}
