import { useState } from "react"
import {
  FolderInput,
  Trash2,
  Eye,
  EyeOff,
  X,
  CheckSquare,
  Folder,
  FolderMinus
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
import { useCollectionsListQuery } from "@/features/collections/hooks/useCollectionsListQuery"
import type { NoteVisibility } from "../models/note.model"

interface BulkActionsToolbarProps {
  readonly selectedNoteIds: string[]
  readonly onDeselectAll: () => void
  readonly onActionComplete: () => void
}

export function BulkActionsToolbar({
  selectedNoteIds,
  onDeselectAll,
  onActionComplete
}: Readonly<BulkActionsToolbarProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const updateMutation = useUpdateNoteMutation()
  const deleteMutation = useDeleteNoteMutation()
  const { data: collectionsData } = useCollectionsListQuery()
  const collections = collectionsData?.items ?? []

  const handleBulkDelete = async () => {
    setIsProcessing(true)
    try {
      for (const noteId of selectedNoteIds) {
        await deleteMutation.mutateAsync(noteId)
      }
      toast.success(`${selectedNoteIds.length} note(s) supprimée(s)`)
      onActionComplete()
      onDeselectAll()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsProcessing(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleBulkMove = async (collectionId: string | null) => {
    setIsProcessing(true)
    try {
      for (const noteId of selectedNoteIds) {
        await updateMutation.mutateAsync({
          noteId,
          payload: { collectionId }
        })
      }
      const message = collectionId
        ? `${selectedNoteIds.length} note(s) déplacée(s)`
        : `${selectedNoteIds.length} note(s) retirée(s) de leur collection`
      toast.success(message)
      onActionComplete()
      onDeselectAll()
    } catch (error) {
      toast.error("Erreur lors du déplacement")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkVisibility = async (visibility: NoteVisibility) => {
    setIsProcessing(true)
    try {
      for (const noteId of selectedNoteIds) {
        await updateMutation.mutateAsync({
          noteId,
          payload: { visibility }
        })
      }
      toast.success(`${selectedNoteIds.length} note(s) mise(s) à jour`)
      onActionComplete()
      onDeselectAll()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 flex items-center gap-3">
          <div className="flex items-center gap-2 px-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {selectedNoteIds.length} note{selectedNoteIds.length > 1 ? "s" : ""} sélectionnée{selectedNoteIds.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Déplacer vers */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isProcessing}
              >
                <FolderInput className="h-4 w-4" />
                Déplacer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => handleBulkMove(null)}>
                <FolderMinus className="h-4 w-4" />
                Retirer de la collection
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {collections.map(collection => (
                <DropdownMenuItem
                  key={collection.id}
                  onClick={() => handleBulkMove(collection.id)}
                >
                  <Folder className="h-4 w-4" />
                  {collection.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Visibilité */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isProcessing}
              >
                <Eye className="h-4 w-4" />
                Visibilité
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkVisibility("public")}>
                <Eye className="h-4 w-4" />
                Rendre publiques
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkVisibility("private")}>
                <EyeOff className="h-4 w-4" />
                Rendre privées
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Supprimer */}
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isProcessing}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Annuler */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les notes</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedNoteIds.length} note{selectedNoteIds.length > 1 ? "s" : ""} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
