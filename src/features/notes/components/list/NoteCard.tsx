import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  CalendarClock,
  Eye,
  FileText,
  Lock,
  MoreHorizontal,
  User2,
} from "lucide-react"
import type { Note } from "../../models/note.model"
import { useToggleNoteFavoriteMutation } from "../../hooks/useToggleNoteFavoriteMutation"
import { FavoriteButton } from "@/components/favorite-button"
import { cn } from "@/lib/utils"

type NoteCardMode = "default" | "favorites"

interface NoteCardProps {
  note: Note
  mode?: NoteCardMode
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))

export function NoteCard({
  note,
  mode = "default",
  onEdit,
  onDelete,
}: Readonly<NoteCardProps>) {
  const isPublic = note.visibility === "public"
  const toggleFavorite = useToggleNoteFavoriteMutation()

  const favorite = note.isFavorite === true

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite.mutate({ noteId: note.id, next: !favorite })
  }

  const to =
    mode === "favorites"
      ? "/app/workspace/favorites/notes/$noteId"
      : "/app/workspace/notes/$noteId"

  return (
    <Link
      to={to}
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
                {note.content || "Aucun contenu"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
          <FavoriteButton
            pressed={favorite}
            label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            disabled={toggleFavorite.isPending}
            onClick={handleFavoriteClick}
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-foreground",
              !favorite && "opacity-0 group-hover:opacity-100"
            )}
          />


            {/* ... menu (edit/delete) */}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    aria-label="Options de la note"
                    title="Options"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
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
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="line-clamp-2 leading-relaxed">{note.content}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-foreground">
              <User2 className="h-3.5 w-3.5" aria-hidden="true" />
              {note.ownerUsername}
              <span className="text-muted-foreground">•</span>
              {isPublic ? (
                <>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Publique
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Privée
                </>
              )}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Mis à jour le {formatDate(note.updatedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
