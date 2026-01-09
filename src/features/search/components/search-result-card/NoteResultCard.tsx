import { Link } from "@tanstack/react-router"
import { FileText, FolderClosed, Eye, Lock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagList } from "@/components/ui/tag-list"
import type { Note } from "@/features/notes/models/note.model"
import {
  VISIBILITY_BADGE_CLASSES,
  VISIBILITY_LABELS,
  formatShortDate,
} from "@/lib/format.utils"

type NoteResultCardProps = {
  note: Note
}

export function NoteResultCard({ note }: Readonly<NoteResultCardProps>) {
  const isPublic = note.visibility === "public"

  return (
    <Link
      to="/app/workspace/notes/$noteId"
      params={{ noteId: note.id }}
      className="block h-full"
      aria-label={`Ouvrir la note ${note.title}`}
    >
      <Card className="group flex h-full flex-col justify-between border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shrink-0">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-base leading-tight line-clamp-2">
                {note.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Contenu non disponible
              </p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className={VISIBILITY_BADGE_CLASSES[note.visibility]}
          >
            {isPublic ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {VISIBILITY_LABELS[note.visibility]}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FolderClosed className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {note.collectionName ?? "Sans collection"}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span>{formatShortDate(note.createdAt)}</span>
          </div>

          {!!note.tags.length && (
            <TagList
              tags={note.tags}
              maxVisible={3}
              size="sm"
              variant="outline"
            />
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
