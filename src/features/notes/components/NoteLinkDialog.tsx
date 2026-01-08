import { memo } from "react"
import { Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLinkNotes } from "../hooks/useLinkNotes"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"
import { NoteLinkList } from "./note-link-dialog/NoteLinkList"

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
          <Button onClick={handleSubmit} disabled={!selectedNoteId || isPending}>
            {isPending ? "Liaison..." : "Lier la note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
