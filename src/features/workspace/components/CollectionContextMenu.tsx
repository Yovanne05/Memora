import { useState } from "react"
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
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

import { useUpdateCollectionMutation } from "@/features/collections/hooks/useUpdateCollectionMutation"
import { useDeleteCollectionMutation } from "@/features/collections/hooks/useDeleteCollectionMutation"
import type { Collection } from "@/features/collections/models/collection.model"

interface CollectionContextMenuProps {
  readonly collection: Collection
  readonly children: React.ReactNode
  readonly onActionComplete?: () => void
  readonly onAddNote?: () => void
}

export function CollectionContextMenu({
  collection,
  children,
  onActionComplete,
  onAddNote
}: Readonly<CollectionContextMenuProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const navigate = useNavigate()

  const updateMutation = useUpdateCollectionMutation({ onSuccess: onActionComplete })
  const deleteMutation = useDeleteCollectionMutation({ onSuccess: onActionComplete })

  const handleToggleVisibility = async () => {
    const newVisibility = collection.visibility === "private" ? "public" : "private"
    await updateMutation.mutateAsync({
      id: collection.id,
      data: { visibility: newVisibility }
    })
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(collection.id)
    setDeleteDialogOpen(false)
  }

  const handleOpenInNewTab = () => {
    window.open(`/app/workspace/collections/${collection.id}`, "_blank")
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => navigate({ to: `/app/workspace/collections/${collection.id}` })}>
            <Edit className="h-4 w-4" />
            Ouvrir
          </ContextMenuItem>

          <ContextMenuItem onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4" />
            Ouvrir dans un nouvel onglet
          </ContextMenuItem>

          <ContextMenuSeparator />

          {onAddNote && (
            <>
              <ContextMenuItem onClick={onAddNote}>
                <Plus className="h-4 w-4" />
                Ajouter une note
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}

          <ContextMenuItem onClick={handleToggleVisibility}>
            {collection.visibility === "private" ? (
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
            <AlertDialogTitle>Supprimer la collection</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{collection.name}" ? Cette action est irréversible.
              {collection.notes.length > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Attention : Cette collection contient {collection.notes.length} note(s).
                </span>
              )}
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
