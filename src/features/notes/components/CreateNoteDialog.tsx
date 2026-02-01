import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import type { NoteVisibility } from "../models/note.model"
import { CollectionField } from "./create-note-dialog/CollectionField"
import { TagsField } from "./create-note-dialog/TagsField"
import { TitleField } from "./create-note-dialog/TitleField"
import { VisibilityField } from "./create-note-dialog/VisibilityField"
import { useCreateNoteForm } from "../hooks/useCreateNoteForm"

interface CreateNoteDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onSubmit: (payload: {
    title: string
    collectionId: string | null
    visibility: NoteVisibility
    tags: string[]
  }) => Promise<void> | void
  submitting?: boolean
}

export function CreateNoteDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: Readonly<CreateNoteDialogProps>) {
  const {
    form,
    collections,
    loadingCollections,
    titleValue,
    isFormDisabled,
    handleFormSubmit,
  } = useCreateNoteForm({ submitting, onSubmit })

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          form.reset()
        }
        onOpenChange(value)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle note</DialogTitle>
          <DialogDescription>
            Renseigne le nom, la collection et la visibilité de la note.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <TitleField control={form.control} isFormDisabled={isFormDisabled} />
            <CollectionField
              control={form.control}
              collections={collections}
              loadingCollections={loadingCollections}
              isFormDisabled={isFormDisabled}
            />
            <VisibilityField control={form.control} isFormDisabled={isFormDisabled} />
            <TagsField
              control={form.control}
              isFormDisabled={isFormDisabled}
              errorMessage={form.formState.errors.tags?.message}
            />
            <DialogFooter className="gap-2">
              <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={isFormDisabled}>
                Annuler
              </Button>
              <Button type="submit" disabled={isFormDisabled || !titleValue.trim()}>
                {submitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}



