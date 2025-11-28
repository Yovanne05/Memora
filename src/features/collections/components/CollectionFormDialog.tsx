import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CollectionEditForm,
  type CollectionFormValues,
} from "./CollectionEditForm"
import type { CollectionVisibility } from "../models/collection.model"

type FormMode = "create" | "edit"

interface BaseProps {
  mode: FormMode
  open: boolean
  loading?: boolean
  onSubmit: (values: CollectionFormValues) => Promise<void> | void
  onClose: () => void
}

interface CreateProps extends BaseProps {
  mode: "create"
}

interface EditProps extends BaseProps {
  mode: "edit"
  initial: {
    name: string
    description: string
    visibility: CollectionVisibility
  }
}

type CollectionFormDialogProps = CreateProps | EditProps

export function CollectionFormDialog(props: CollectionFormDialogProps) {
  const { mode, open, loading = false, onSubmit, onClose } = props

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New collection" : "Edit collection"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new space to group related notes."
              : "Update the name, description or visibility of this collection."}
          </DialogDescription>
        </DialogHeader>

        <CollectionEditForm
          mode={mode}
          loading={loading}
          initial={mode === "edit" ? props.initial : undefined}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
