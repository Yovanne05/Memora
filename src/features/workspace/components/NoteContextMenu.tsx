import { useState } from "react"
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import { useDeleteNoteMutation } from "@/features/notes/hooks/useDeleteNoteMutation"
import type { Note } from "@/features/notes/models/note.model"

interface NoteContextMenuProps {
  readonly note: Note
  readonly children: React.ReactNode
  readonly onActionComplete?: () => void
}

export function NoteContextMenu({
  note,
  children,
  onActionComplete
}: Readonly<NoteContextMenuProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const navigate = useNavigate()

  const updateMutation = useUpdateNoteMutation({ onSuccess: onActionComplete })
  const deleteMutation = useDeleteNoteMutation({ onSuccess: onActionComplete })

  const handleToggleVisibility = async () => {
    const newVisibility = note.visibility === "private" ? "public" : "private"
    await updateMutation.mutateAsync({
      noteId: note.id,
      payload: { visibility: newVisibility }
    })
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(note.id)
    setDeleteDialogOpen(false)
  }

  const handleOpenInNewTab = () => {
    const path = note.collectionId
      ? `/app/workspace/collections/${note.collectionId}/notes/${note.id}`
      : `/app/workspace/notes/${note.id}`
    window.open(path, "_blank")
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => navigate({ to: `/app/workspace/notes/${note.id}` })}>
            <Edit className="h-4 w-4" />
            Modifier
          </ContextMenuItem>

          <ContextMenuItem onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4" />
            Ouvrir dans un nouvel onglet
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleToggleVisibility}>
            {note.visibility === "private" ? (
              <>
                <Eye className="h-4 w-4" />
                Rendre publique
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Rendre privée
              </>
            )}
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la note</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{note.title}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
