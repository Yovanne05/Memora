import { useState } from "react"
import { Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateNoteLinkMutation } from "@/features/notes/hooks/useCreateNoteLinkMutation"
import { useDeleteNoteLinkMutation } from "@/features/notes/hooks/useDeleteNoteLinkMutation"
import { useNoteLinksQuery } from "@/features/notes/hooks/useNoteLinksQuery"
import type { Note } from "@/features/notes/models/note.model"
import { NoteLinkList } from "./NoteLinkList"

type NoteLinkButtonProps = {
  note: Note
  availableNotes: Note[]
}

export function NoteLinkButton({
  note,
  availableNotes,
}: Readonly<NoteLinkButtonProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: links } = useNoteLinksQuery(note.id)
  const createLink = useCreateNoteLinkMutation(note.id)
  const deleteLink = useDeleteNoteLinkMutation(note.id)

  const linkedNoteIds = new Set(links?.map((link) => link.linkedNoteId) ?? [])
  const notesToShow = availableNotes.filter((item) => item.id !== note.id)

  const handleToggleLink = async (targetNoteId: string) => {
    try {
      if (linkedNoteIds.has(targetNoteId)) {
        await deleteLink.mutateAsync(targetNoteId)
      } else {
        await createLink.mutateAsync({ linkedNoteId: targetNoteId })
      }
    } catch (error) {
      console.error("Failed to toggle link:", error)
    }
  }

  if (notesToShow.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Link2 className="h-3.5 w-3.5 mr-1.5" />
          Lier ({linkedNoteIds.size})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lier "{note.title}"</DialogTitle>
          <DialogDescription>
            Cochez les notes que vous souhaitez lier à cette note
          </DialogDescription>
        </DialogHeader>
        <NoteLinkList
          notes={notesToShow}
          linkedNoteIds={linkedNoteIds}
          isPending={createLink.isPending || deleteLink.isPending}
          onToggle={handleToggleLink}
        />
      </DialogContent>
    </Dialog>
  )
}
