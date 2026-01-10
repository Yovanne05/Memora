import { useState, useCallback } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import type { Note } from '../models/note.model'
import { ResourceCard } from '@/components/shared/ResourceCard'
import { NoteQuickActions } from './NoteQuickActions'
import { getContentPreview } from '@/lib/html-utils'
import { buildNoteCardActions } from './note-card/buildNoteCardActions'
import { NoteCardFavoriteButton } from './note-card/NoteCardFavoriteButton'
import { NoteCardMeta } from './note-card/NoteCardMeta'
import type { DraggedNoteData } from '../hooks/useDragAndDropNotes'

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
  const navigate = useNavigate()
  const location = useLocation()
  const [isInteracting, setIsInteracting] = useState(false)
  const favorite = note.isFavorite === true
  const actions = buildNoteCardActions({
    note,
    onEdit,
    onDelete,
    showQuickActions,
  })

  const dragData: DraggedNoteData = { note }
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `note-${note.id}`,
      data: dragData,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const handleInteractionChange = useCallback((interacting: boolean) => {
    setIsInteracting(interacting)
  }, [])

  const favoriteButton = showFavoriteButton ? (
    <NoteCardFavoriteButton noteId={note.id} favorite={favorite} />
  ) : null

  const headerActions = showQuickActions ? (
    <div className="flex items-center gap-1">
      {favoriteButton}
      <NoteQuickActions
        note={note}
        triggerVariant="ghost"
        onInteractionChange={handleInteractionChange}
      />
    </div>
  ) : (
    favoriteButton
  )

  const contentPreview = note.content
    ? getContentPreview(note.content, 150)
    : 'Aucun contenu'

  const handleClick = () => {
    if (isInteracting) return
    const base = location.pathname.startsWith('/app/workspace/favorites')
      ? '/app/workspace/favorites'
      : '/app/workspace'
    const path = note.collectionId
      ? `${base}/collections/${note.collectionId}/notes/${note.id}`
      : `${base}/notes/${note.id}`
    navigate({
      to: path,
      params: { noteId: note.id },
    })
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ResourceCard
        id={note.id}
        title={note.title}
        description={contentPreview}
        icon={FileText}
        actions={actions}
        headerActions={headerActions}
        metadata={<NoteCardMeta note={note} />}
        onClick={handleClick}
      />
    </div>
  )
}
