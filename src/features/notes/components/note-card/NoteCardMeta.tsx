import { CalendarClock, Eye, Lock, User2 } from "lucide-react"

import type { Note } from "../../models/note.model"
import { formatNoteDate } from "./formatDate"

type NoteCardMetaProps = {
  note: Note
}

export function NoteCardMeta({ note }: Readonly<NoteCardMetaProps>) {
  const isPublic = note.visibility === "public"

  return (
    <>
      <span className="flex items-center gap-1 text-xs text-foreground">
        <User2 className="h-3.5 w-3.5" />
        {note.ownerUsername}
        <span className="text-muted-foreground">•</span>
        {isPublic ? (
          <>
            <Eye className="h-3.5 w-3.5" />
            Publique
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" />
            Privée
          </>
        )}
      </span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" />
        Mis à jour le {formatNoteDate(note.updatedAt)}
      </span>
    </>
  )
}
