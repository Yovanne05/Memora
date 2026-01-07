import { Link } from "@tanstack/react-router"
import type { Note } from "../models/note.model"
import { ResourceCard, type ResourceCardAction } from "@/components/shared/ResourceCard"
import { CalendarClock, Eye, FileText, Lock, Star, User2 } from "lucide-react"
import { NoteQuickActions } from "./NoteQuickActions"
import { getContentPreview } from "@/lib/html-utils"
import { useToggleNoteFavoriteMutation } from "../hooks/useToggleNoteFavoriteMutation"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"

interface NoteCardProps {
  note: Note
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
  showQuickActions?: boolean
  showFavoriteButton?: boolean
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))

export function NoteCard({
  note,
  onEdit,
  onDelete,
  showQuickActions = false,
  showFavoriteButton = false
}: Readonly<NoteCardProps>) {
  const isPublic = note.visibility === "public"
  const toggleFavorite = useToggleNoteFavoriteMutation()
  const favorite = note.isFavorite === true

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toggleFavorite.mutate({ noteId: note.id, next: !favorite })
    },
    [toggleFavorite, note.id, favorite]
  )

  const actions: ResourceCardAction[] = []

  // Si showQuickActions est true, on ne génère pas d'actions car on utilise NoteQuickActions
  if (!showQuickActions) {
    if (onEdit) {
      actions.push({
        label: "Modifier",
        onClick: (e) => {
          e.preventDefault()
          onEdit(note)
        },
      })
    }
    if (onDelete) {
      actions.push({
        label: "Supprimer",
        variant: "destructive",
        onClick: (e) => {
          e.preventDefault()
          onDelete(note)
        },
      })
    }
  }

  const metadata = (
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
        Mis à jour le {formatDate(note.updatedAt)}
      </span>
    </>
  )

  const favoriteButton = showFavoriteButton ? (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
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
  ) : null

  const headerActions = showQuickActions ? (
    <div className="flex items-center gap-1">
      {favoriteButton}
      <NoteQuickActions note={note} triggerVariant="ghost" />
    </div>
  ) : favoriteButton

  const contentPreview = note.content
    ? getContentPreview(note.content, 150)
    : "Aucun contenu"

  return (
    <Link
      to="/app/workspace/notes/$noteId"
      params={{ noteId: note.id }}
      className="block h-full"
      aria-label={`Ouvrir la note ${note.title}`}
    >
      <ResourceCard
        id={note.id}
        title={note.title}
        description={contentPreview}
        icon={FileText}
        actions={actions}
        headerActions={headerActions}
        metadata={metadata}
      />
    </Link>
  )
}
