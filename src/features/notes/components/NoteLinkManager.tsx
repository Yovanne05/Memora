import { useState } from "react"
import { Link2, Trash2, Plus } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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

import { useNoteLinksQuery } from "../hooks/useNoteLinksQuery"
import { useLinkedNotesQuery } from "../hooks/useLinkedNotesQuery"
import { useDeleteNoteLinkMutation } from "../hooks/useDeleteNoteLinkMutation"
import { NoteLinkDialog } from "./NoteLinkDialog"
import type { Note } from "../models/note.model"

interface NoteLinkManagerProps {
  note: Note
}

export function NoteLinkManager({ note }: NoteLinkManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null)

  const { data: links, isLoading: isLoadingLinks } = useNoteLinksQuery(note.id)
  const { notes: linkedNotes, isLoading: isLoadingNotes } = useLinkedNotesQuery(links)
  const deleteLink = useDeleteNoteLinkMutation(note.id)

  const handleDeleteLink = async (linkedNoteId: string) => {
    await deleteLink.mutateAsync(linkedNoteId)
    setLinkToDelete(null)
  }

  const isLoading = isLoadingLinks || isLoadingNotes

  return (
    <Card className="border border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Notes liées ({linkedNotes.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!note.collectionId}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Lier une note
          </Button>
        </div>
        {!note.collectionId && (
          <p className="text-xs text-muted-foreground">
            La note doit appartenir à une collection pour être liée
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!isLoading && linkedNotes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune note liée
          </p>
        )}

        {!isLoading && linkedNotes.map(linkedNote => (
          <div
            key={linkedNote.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{linkedNote.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {linkedNote.content}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to="/app/notes/$id" params={{ id: linkedNote.id }}>
                  Voir
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setLinkToDelete(linkedNote.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <NoteLinkDialog
        note={note}
        existingLinks={links ?? []}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <AlertDialog
        open={Boolean(linkToDelete)}
        onOpenChange={(open) => !open && setLinkToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le lien</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est réversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => linkToDelete && handleDeleteLink(linkToDelete)}
              disabled={deleteLink.isPending}
            >
              {deleteLink.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
