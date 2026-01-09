import { Link } from "@tanstack/react-router"
import { FileText } from "lucide-react"

import type { Note } from "../models/note.model"
import { ResourceCard } from "@/components/shared/ResourceCard"
import { NoteQuickActions } from "./NoteQuickActions"
import { buildNoteCardActions } from "./note-card/buildNoteCardActions"
import { NoteCardFavoriteButton } from "./note-card/NoteCardFavoriteButton"
import { NoteCardMeta } from "./note-card/NoteCardMeta"

interface NoteCardProps {
  note: Note
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
  showQuickActions?: boolean
  showFavoriteButton?: boolean
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  showQuickActions = false,
  showFavoriteButton = false,
}: Readonly<NoteCardProps>) {
  const favorite = note.isFavorite === true
  const actions = buildNoteCardActions({ note, onEdit, onDelete, showQuickActions })

  const favoriteButton = showFavoriteButton ? (
    <NoteCardFavoriteButton noteId={note.id} favorite={favorite} />
  ) : null

  const headerActions = showQuickActions ? (
    <div className="flex items-center gap-1">
      {favoriteButton}
      <NoteQuickActions note={note} triggerVariant="ghost" />
    </div>
  ) : (
    favoriteButton
  )

  const contentPreview = "Contenu non disponible"

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
        metadata={<NoteCardMeta note={note} />}
      />
    </Link>
  )
}
