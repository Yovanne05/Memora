import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { TagList } from "@/components/ui/tag-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, Eye, FileText, FolderClosed, Lock, Tag, User2 } from "lucide-react"
import type { Note } from "../../models/note.model"
import { NoteQuickActions } from "../NoteQuickActions"
import { formatShortDate } from "@/lib/format.utils"
import { getContentPreview } from "@/lib/html-utils"

interface NoteCardProps {
  note: Note
  onActionComplete?: () => void
}

export function NoteCard({ note, onActionComplete }: Readonly<NoteCardProps>) {
  const isPublic = note.visibility === "public"
  const contentPreview = getContentPreview(note.content, 100)

  return (
    <Link
      to="/app/workspace/notes/$noteId"
      params={{ noteId: note.id }}
      className="block h-full"
      aria-label={`Ouvrir la note ${note.title}`}
    >
      <Card className="group flex h-full flex-col justify-between border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-base leading-tight line-clamp-2">
                {note.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {contentPreview || "Aucun contenu"}
              </p>
            </div>
          </div>

          <div onClick={(e) => e.preventDefault()}>
            <NoteQuickActions
              note={note}
              onActionComplete={onActionComplete}
              triggerVariant="ghost"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
          <Badge variant="secondary" className="inline-flex items-center gap-1">
            <FolderClosed className="h-3.5 w-3.5" />
            <span className="truncate max-w-40">{note.collectionName ?? "Sans collection"}</span>
          </Badge>

          <div className="space-y-2">
            {!!note.tags.length && (
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <TagList tags={note.tags} maxVisible={3} size="sm" variant="outline" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-foreground">
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
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                Mis à jour le {formatShortDate(note.updatedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
