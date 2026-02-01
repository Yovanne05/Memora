import { Link2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import type { Note } from "../../models/note.model"

type NoteLinksHeaderProps = {
  note: Note
  linkedCount: number
  onAddLink: () => void
}

export function NoteLinksHeader({
  note,
  linkedCount,
  onAddLink,
}: Readonly<NoteLinksHeaderProps>) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Notes liées ({linkedCount})
        </CardTitle>
        <Button
          size="sm"
          onClick={onAddLink}
          disabled={!note.collectionId}
          variant="outline"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Lier une note
        </Button>
      </div>
      {!note.collectionId && (
        <p className="text-xs text-muted-foreground">
          La note doit appartenir à une collection pour être liée
        </p>
      )}
    </CardHeader>
  )
}
