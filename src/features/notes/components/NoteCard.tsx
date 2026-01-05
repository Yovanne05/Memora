import { Link } from "@tanstack/react-router"
import type { Note } from "../models/note.model"
import { ResourceCard, type ResourceCardAction } from "@/components/shared/ResourceCard"
import { CalendarClock, Eye, FileText, Lock, User2 } from "lucide-react"

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

export function NoteCard({ note, onEdit, onDelete }: Readonly<NoteCardProps>) {
  const isPublic = note.visibility === "public"

  const actions: ResourceCardAction[] = []
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
        description={note.content || "Aucun contenu"}
        icon={FileText}
        actions={actions}
        metadata={metadata}
      />
    </Link>
  )
}
