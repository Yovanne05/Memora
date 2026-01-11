import { memo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLinkNotes } from '../hooks/useLinkNotes'
import type { Note } from '../models/note.model'
import type { NoteLink } from '../models/note-link.model'
import { NoteLinkList } from './note-link-dialog/NoteLinkList'
import { NoteLinkFormFields } from './note-link-dialog/NoteLinkFormFields'

interface NoteLinkDialogProps {
  readonly note: Note
  readonly existingLinks: NoteLink[]
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export const NoteLinkDialog = memo(function NoteLinkDialog({
  note,
  existingLinks,
  open,
  onOpenChange,
}: Readonly<NoteLinkDialogProps>) {
  const {
    searchQuery,
    setSearchQuery,
    selectedNoteId,
    setSelectedNoteId,
    availableNotes,
    isLoading,
    isPending,
    handleCreateLink,
    resetState,
  } = useLinkNotes({
    note,
    existingLinks,
    onSuccess: () => onOpenChange(false),
  })

  const [linkLabel, setLinkLabel] = useState('')

  const normalizedLabel = linkLabel.trim()
  const canSubmit =
    Boolean(selectedNoteId) &&
    normalizedLabel.length > 0 &&
    normalizedLabel.length <= 80 &&
    !isPending

  const handleSubmit = async () => {
    if (!selectedNoteId) return
    if (normalizedLabel.length === 0) return

    const success = await handleCreateLink(selectedNoteId, normalizedLabel)
    if (!success) {
      alert('Impossible de créer le lien')
    }
  }

  const handleClose = () => {
    setLinkLabel('')
    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Lier une note</DialogTitle>
          <DialogDescription>
            Sélectionnez une note de la même collection à lier et donnez un nom
            au lien
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <NoteLinkFormFields
            linkLabel={linkLabel}
            searchQuery={searchQuery}
            onLinkLabelChange={setLinkLabel}
            onSearchQueryChange={setSearchQuery}
          />

          <NoteLinkList
            items={availableNotes}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedId={selectedNoteId}
            onSelect={setSelectedNoteId}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isPending ? 'Liaison...' : 'Lier la note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
