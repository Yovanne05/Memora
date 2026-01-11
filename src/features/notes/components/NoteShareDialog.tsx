import { ShareDialog } from '@/components/shared/ShareDialog'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNoteSharing } from '../hooks/useNoteSharing'

interface NoteShareDialogProps {
  noteId: string
  noteTitle: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function NoteShareDialog({
  noteId,
  noteTitle,
  open,
  onOpenChange,
  trigger,
}: NoteShareDialogProps) {
  const { user } = useAuth()
  const { shares, isLoading, addShare, updateShare, removeShare } =
    useNoteSharing(noteId)

  if (!user) return null

  return (
    <ShareDialog
      title={`Partager "${noteTitle}"`}
      description="Partager cette note avec d'autres utilisateurs"
      shares={shares}
      currentUserId={user.id}
      onAddShare={addShare}
      onUpdateShare={updateShare}
      onRemoveShare={removeShare}
      isLoading={isLoading}
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
    />
  )
}
