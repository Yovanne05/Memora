import { useState } from "react"
import {
  FolderInput,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  MoreVertical,
  Folder,
  FolderMinus,
  Link2
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import { useUpdateNoteMutation } from "../hooks/useUpdateNoteMutation"
import { useDeleteNoteMutation } from "../hooks/useDeleteNoteMutation"
import { useCreateNoteMutation } from "../hooks/useCreateNoteMutation"
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { Note } from "../models/note.model"

interface NoteQuickActionsProps {
  readonly note: Note
  readonly onActionComplete?: () => void
  readonly triggerVariant?: "ghost" | "outline" | "default"
  readonly showLabel?: boolean
}

export function NoteQuickActions({
  note,
  onActionComplete,
  triggerVariant = "ghost",
  showLabel = false
}: Readonly<NoteQuickActionsProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const updateMutation = useUpdateNoteMutation({ onSuccess: onActionComplete })
  const deleteMutation = useDeleteNoteMutation({ onSuccess: onActionComplete })
  const duplicateMutation = useCreateNoteMutation({ onSuccess: onActionComplete })
  const { data: collectionsData } = useCollectionsQuery()
  const collections = collectionsData?.items ?? []

  const handleToggleVisibility = async () => {
    const newVisibility = note.visibility === "private" ? "public" : "private"
    await updateMutation.mutateAsync({
      noteId: note.id,
      payload: { visibility: newVisibility }
    })
    setIsDropdownOpen(false)
  }

  const handleMoveToCollection = async (collectionId: string | null) => {
    await updateMutation.mutateAsync({
      noteId: note.id,
      payload: { collectionId }
    })
    setIsDropdownOpen(false)
  }

  const handleDuplicate = async () => {
    await duplicateMutation.mutateAsync({
      ownerId: note.ownerId,
      title: `${note.title} (copie)`,
      content: note.content,
      collectionId: note.collectionId,
      visibility: note.visibility,
      tags: note.tags,
    })
    toast.success("Note dupliquée")
    setIsDropdownOpen(false)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(note.id)
    setDeleteDialogOpen(false)
  }

  const isPending = updateMutation.isPending || deleteMutation.isPending || duplicateMutation.isPending

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={triggerVariant}
            size={showLabel ? "sm" : "icon"}
            className={showLabel ? "gap-2" : ""}
            disabled={isPending}
          >
            <MoreVertical className="h-4 w-4" />
            {showLabel && "Actions"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">

          {/* Toggle Visibilité */}
          <DropdownMenuItem
            onClick={handleToggleVisibility}
            disabled={isPending}
          >
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
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Déplacer vers collection */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isPending}>
              <FolderInput className="h-4 w-4" />
              Déplacer vers
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
              {note.collectionId && (
                <>
                  <DropdownMenuItem onClick={() => handleMoveToCollection(null)}>
                    <FolderMinus className="h-4 w-4" />
                    Retirer de la collection
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {collections.length === 0 ? (
                <DropdownMenuItem disabled>
                  Aucune collection disponible
                </DropdownMenuItem>
              ) : (
                collections
                  .filter(col => col.id !== note.collectionId)
                  .map(collection => (
                    <DropdownMenuItem
                      key={collection.id}
                      onClick={() => handleMoveToCollection(collection.id)}
                    >
                      <Folder className="h-4 w-4" />
                      {collection.name}
                    </DropdownMenuItem>
                  ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Dupliquer */}
          <DropdownMenuItem
            onClick={handleDuplicate}
            disabled={isPending}
          >
            <Copy className="h-4 w-4" />
            Dupliquer
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Supprimer */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setIsDropdownOpen(false)
              setDeleteDialogOpen(true)
            }}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogue de confirmation de suppression */}
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
