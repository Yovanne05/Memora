import { useState } from "react"

import { Card } from "@/components/ui/card"
import { NoteLinkDialog } from "./NoteLinkDialog"
import { NoteLinkDeleteDialog } from "./note-link-manager/NoteLinkDeleteDialog"
import { NoteLinksHeader } from "./note-link-manager/NoteLinksHeader"
import { NoteLinksList } from "./note-link-manager/NoteLinksList"
import { useDeleteNoteLinkMutation } from "../hooks/useDeleteNoteLinkMutation"
import { useLinkedNotesQuery } from "../hooks/useLinkedNotesQuery"
import { useNoteLinksQuery } from "../hooks/useNoteLinksQuery"
import type { Note } from "../models/note.model"

interface NoteLinkManagerProps {
  readonly note: Note
}

export function NoteLinkManager({ note }: Readonly<NoteLinkManagerProps>) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null)

  const { data: links, isLoading: isLoadingLinks } = useNoteLinksQuery(note.id)
  const { notes: linkedNotes, isLoading: isLoadingNotes } = useLinkedNotesQuery(links)
  const deleteLink = useDeleteNoteLinkMutation(note.id)

  const handleDeleteLink = async (linkedNoteId: string) => {
    await deleteLink.mutateAsync(linkedNoteId)
    setLinkToDelete(null)
  }

  const isLoading = isLoadingLinks || isLoadingNotes

  return (
    <Card className="border border-border/70 shadow-sm">
      <NoteLinksHeader
        note={note}
        linkedCount={linkedNotes.length}
        onAddLink={() => setIsAddDialogOpen(true)}
      />

      <NoteLinksList
        notes={linkedNotes}
        isLoading={isLoading}
        onDelete={setLinkToDelete}
      />

      <NoteLinkDialog
        note={note}
        existingLinks={links ?? []}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <NoteLinkDeleteDialog
        open={Boolean(linkToDelete)}
        onOpenChange={(open) => !open && setLinkToDelete(null)}
        isPending={deleteLink.isPending}
        onConfirm={() => linkToDelete && handleDeleteLink(linkToDelete)}
      />
    </Card>
  )
}
