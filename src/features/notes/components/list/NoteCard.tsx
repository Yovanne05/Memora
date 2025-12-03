import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CalendarClock, Eye, FileText, Lock, MoreHorizontal } from "lucide-react"
import type { Note } from "../../models/note.model"

interface NoteCardProps {
  note: Note
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const isPublic = note.visibility === "public"

  return (
    <Link
      to="/app/notes/$id"
      params={{ id: note.id }}
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
                {note.content || "Aucun contenu"}
              </p>
            </div>
          </div>

          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      onEdit(note)
                    }}
                  >
                    Modifier
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      onDelete(note)
                    }}
                  >
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={
                isPublic
                  ? "border-emerald-400/50 bg-emerald-50 text-emerald-700"
                  : "border-border bg-muted text-foreground"
              }
            >
              {isPublic ? "Publique" : "Privée"}
            </Badge>
            <Badge variant="secondary">
              {note.collectionId ? "Dans une collection" : "Sans collection"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-foreground">
              {isPublic ? <Eye className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {isPublic ? "Partagée" : "Privée"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Mis à jour le {formatDate(note.updatedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

