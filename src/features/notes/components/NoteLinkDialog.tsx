import { memo } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLinkNotes } from "../hooks/useLinkNotes"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"
import { NoteLinkDialogFooter } from "./note-link-dialog/NoteLinkDialogFooter"
import { NoteLinkList } from "./note-link-dialog/NoteLinkList"
import { NoteLinkSearch } from "./note-link-dialog/NoteLinkSearch"

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

  const handleSubmit = async () => {
    if (!selectedNoteId) return
    const success = await handleCreateLink(selectedNoteId)
    if (!success) {
      alert("Impossible de créer le lien")
    }
  }

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Lier une note</DialogTitle>
          <DialogDescription>
            Sélectionnez une note de la même collection à lier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <NoteLinkSearch value={searchQuery} onChange={setSearchQuery} />
          <NoteLinkList
            items={availableNotes}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedId={selectedNoteId}
            onSelect={setSelectedNoteId}
          />
        </div>

        <NoteLinkDialogFooter
          onCancel={handleClose}
          onSubmit={handleSubmit}
          isPending={isPending}
          hasSelection={!!selectedNoteId}
        />
      </DialogContent>
    </Dialog>
  )
})
