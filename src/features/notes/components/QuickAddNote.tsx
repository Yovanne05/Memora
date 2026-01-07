import { QuickAddNoteDialog } from "./quick-add-note/QuickAddNoteDialog"
import { QuickAddNoteTrigger } from "./quick-add-note/QuickAddNoteTrigger"
import { useQuickAddNote } from "../hooks/useQuickAddNote"

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
  showLabel = true,
}: Readonly<QuickAddNoteProps>) {
  const {
    open,
    setOpen,
    title,
    setTitle,
    visibility,
    setVisibility,
    createMutation,
    handleSubmit,
    handleClose,
  } = useQuickAddNote({ collectionId, onSuccess })

  return (
    <>
      <QuickAddNoteTrigger
        variant={triggerVariant}
        size={triggerSize}
        showLabel={showLabel}
        onClick={() => setOpen(true)}
      />
      <QuickAddNoteDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        onTitleChange={setTitle}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isPending={createMutation.isPending}
        collectionId={collectionId}
      />
    </>
  )
}
