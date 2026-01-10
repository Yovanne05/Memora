import { memo, useState } from "react"
import { Search } from "lucide-react"

import { memo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLinkNotes } from '../hooks/useLinkNotes'
import type { Note } from '../models/note.model'
import type { NoteLink } from '../models/note-link.model'
import { NoteLinkList } from './note-link-dialog/NoteLinkList'
import { NoteLinkSearchInput } from './note-link-dialog/NoteLinkSearchInput'
import { NoteLinkDialogFooter } from './note-link-dialog/NoteLinkDialogFooter'

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

  const [linkLabel, setLinkLabel] = useState("")

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
      alert("Impossible de créer le lien")
    }
  }

  const handleClose = () => {
    setLinkLabel("")
    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Lier une note</DialogTitle>
          <DialogDescription>
            Sélectionnez une note de la même collection à lier et donnez un nom au lien
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom du lien</label>
            <Input
              value={linkLabel}
              onChange={(event) => setLinkLabel(event.target.value)}
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground">
              {normalizedLabel.length}/80
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une note..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>

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
            {isPending ? "Liaison..." : "Lier la note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
