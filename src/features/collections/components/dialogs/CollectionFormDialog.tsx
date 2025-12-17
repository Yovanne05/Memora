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
} from "../forms/CollectionEditForm"
import type { CollectionVisibility } from "../../models/collection.model"

type FormMode = "create" | "edit"

interface BaseProps {
  mode: FormMode
  open: boolean
  isPending?: boolean
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
    description?: string
    visibility: CollectionVisibility
    tags?: string[]
  }
}

type CollectionFormDialogProps = CreateProps | EditProps

export function CollectionFormDialog(props: CollectionFormDialogProps) {
  const { mode, open, isPending = false, onSubmit, onClose } = props

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouvelle collection" : "Modifier la collection"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créez un nouvel espace pour regrouper des notes liées."
              : "Mettez à jour le nom, la description ou la visibilité de cette collection."}
          </DialogDescription>
        </DialogHeader>

        <CollectionEditForm
          mode={mode}
          loading={isPending}
          initial={mode === "edit" ? props.initial : undefined}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
