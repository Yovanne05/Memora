import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuickAddNoteDialog } from "./quick-add-note/QuickAddNoteDialog"
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
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
        className={showLabel ? "gap-2" : ""}
      >
        <Plus className="h-4 w-4" />
        {showLabel && "Nouvelle note"}
      </Button>
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
