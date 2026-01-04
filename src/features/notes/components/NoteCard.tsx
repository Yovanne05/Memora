import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, LayoutGrid, Star } from "lucide-react"
import { useCallback, useState } from "react"

import type { Note } from "../models/note.model"
import { formatShortDate } from "@/lib/format.utils"
import { useToggleNoteFavoriteMutation } from "../hooks/useToggleNoteFavoriteMutation"

interface NoteCardProps {
  readonly note: Note
  readonly onPreview?: (note: Note) => void
}

export function NoteCard({ note, onPreview }: Readonly<NoteCardProps>) {
  const toggleFavorite = useToggleNoteFavoriteMutation()
  const [favorite, setFavorite] = useState<boolean>(!!note.isFavorite)

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPreview?.(note)
  }

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const next = !favorite
      setFavorite(next)

      toggleFavorite.mutate(
        { noteId: note.id, next },
        { onError: () => setFavorite(!next) }
      )
    },
    [favorite, toggleFavorite, note.id]
  )

  return (
    <Link to="/app/notes/$id" params={{ id: note.id }} className="block">
      <Card className="h-full border border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg leading-tight line-clamp-2 min-w-0">
              {note.title}
            </CardTitle>

            <div className="flex items-center gap-1">
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
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">
              {note.collectionName ?? "Aucune collection"}
            </Badge>
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
