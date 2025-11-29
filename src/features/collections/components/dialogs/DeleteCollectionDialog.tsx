import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Collection } from "../../models/collection.model"

interface DeleteCollectionDialogProps {
  open: boolean
  collection: Collection | null
  loading?: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteCollectionDialog({
  open,
  collection,
  loading = false,
  error,
  onCancel,
  onConfirm,
}: DeleteCollectionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supprimer la collection</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Elle supprimera définitivement{" "}
            <span className="font-medium text-slate-900">
              {collection?.name ?? "cette collection"}
            </span>{" "}
            ainsi que toutes ses notes et cartes mémoire.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="mb-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
