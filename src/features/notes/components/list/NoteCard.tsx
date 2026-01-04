import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, LayoutGrid, MoreHorizontal, Star } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import type { Note } from "../../models/note.model"
import { formatShortDate } from "@/lib/format.utils"
import { useToggleNoteFavoriteMutation } from "../../hooks/useToggleNoteFavoriteMutation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NoteCardProps {
  readonly note: Note
  readonly onPreview?: (note: Note) => void
  readonly onEdit?: (note: Note) => void
  readonly onDelete?: (note: Note) => void
  readonly readOnly?: boolean
}

export function NoteCard({
  note,
  onPreview,
  onEdit,
  onDelete,
  readOnly = false,
}: Readonly<NoteCardProps>) {
  const toggleFavorite = useToggleNoteFavoriteMutation()
  const [favorite, setFavorite] = useState<boolean>(!!note.isFavorite)

  useEffect(() => {
    setFavorite(!!note.isFavorite)
  }, [note.isFavorite])

  const stop = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent) => {
      stop(e)
      onPreview?.(note)
    },
    [onPreview, note, stop]
  )

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      stop(e)

      const next = !favorite
      setFavorite(next)

      toggleFavorite.mutate(
        { noteId: note.id, next },
        { onError: () => setFavorite(!next) }
      )
    },
    [favorite, toggleFavorite, note.id, stop]
  )

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      stop(e)
      onEdit?.(note)
    },
    [onEdit, note, stop]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      stop(e)
      onDelete?.(note)
    },
    [onDelete, note, stop]
  )

  return (
    <Link to="/app/notes/$id" params={{ id: note.id }} className="block">
      <Card className="h-full border border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight line-clamp-2 min-w-0">
              {note.title}
            </CardTitle>

            <div className="flex items-center gap-1 shrink-0">
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleFavoriteClick}
                  aria-pressed={favorite}
                  aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  disabled={toggleFavorite.isPending}
                >
                  <Star
                    className={`h-4 w-4 transition ${
                      favorite ? "fill-current text-primary" : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                </Button>
              )}

              {onPreview && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handlePreviewClick}
                  title="Aperçu rapide"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              )}

              {!readOnly && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={stop}
                      aria-label="Options de la note"
                      title="Options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {onEdit && (
                      <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                        Modifier
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={handleDelete}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">{note.collectionName ?? "Aucune collection"}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="line-clamp-2 leading-relaxed">{note.content}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {note.visibility === "public" ? "Partagée" : "Privée"}
            </span>

            <span className="flex items-center gap-1">
              Mis à jour le {formatShortDate(note.updatedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
