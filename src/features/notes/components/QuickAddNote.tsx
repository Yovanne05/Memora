import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCreateNoteMutation } from "../hooks/useCreateNoteMutation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { NoteVisibility } from "../models/note.model"

interface QuickAddNoteProps {
  readonly collectionId?: string | null
  readonly onSuccess?: () => void
  readonly triggerVariant?: "default" | "outline" | "ghost"
  readonly triggerSize?: "default" | "sm" | "lg" | "icon"
  readonly showLabel?: boolean
}

export function QuickAddNote({
  collectionId = null,
  onSuccess,
  triggerVariant = "outline",
  triggerSize = "sm",
  showLabel = true
}: Readonly<QuickAddNoteProps>) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState<NoteVisibility>("private")

  const { user } = useAuth()
  const createMutation = useCreateNoteMutation({
    onSuccess: () => {
      onSuccess?.()
      handleClose()
    }
  })

  const handleClose = () => {
    setOpen(false)
    setTitle("")
    setVisibility("private")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Le titre est requis")
      return
    }

    if (!user) {
      toast.error("Vous devez être connecté")
      return
    }

    await createMutation.mutateAsync({
      ownerId: user.id,
      title: title.trim(),
      content: "",
      collectionId,
      visibility,
      tags: [],
    })
  }

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
        className={showLabel ? "gap-2" : ""}
      >
        <Plus className="h-4 w-4" />
        {showLabel && "Nouvelle note"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Créer une note rapide</DialogTitle>
              <DialogDescription>
                {collectionId
                  ? "La note sera ajoutée à cette collection"
                  : "Créez une nouvelle note sans collection"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Titre</Label>
                <Input
                  id="note-title"
                  placeholder="Titre de la note..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-visibility">Visibilité</Label>
                <Select
                  value={visibility}
                  onValueChange={(val) => setVisibility(val as NoteVisibility)}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger id="note-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Privée</SelectItem>
                    <SelectItem value="public">Publique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
