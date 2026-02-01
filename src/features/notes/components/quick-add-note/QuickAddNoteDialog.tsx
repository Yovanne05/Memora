import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NoteVisibility } from '../../models/note.model'

type QuickAddNoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onTitleChange: (value: string) => void
  visibility: NoteVisibility
  onVisibilityChange: (value: NoteVisibility) => void
  onSubmit: (event: React.FormEvent) => void
  onCancel: () => void
  isPending: boolean
  collectionId?: string | null
}

export function QuickAddNoteDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  visibility,
  onVisibilityChange,
  onSubmit,
  onCancel,
  isPending,
  collectionId,
}: Readonly<QuickAddNoteDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une note rapide</DialogTitle>
            <DialogDescription>
              {collectionId
                ? 'La note sera ajoutée à cette collection'
                : 'Créez une nouvelle note sans collection'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Titre</Label>
              <Input
                id="note-title"
                placeholder="Titre de la note..."
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-visibility">Visibilité</Label>
              <Select
                value={visibility}
                onValueChange={(value) =>
                  onVisibilityChange(value as NoteVisibility)
                }
                disabled={isPending}
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
              onClick={onCancel}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
